const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// File DB Path
const DB_DIR = path.join(__dirname, '../data/db');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let useMongo = false;

// Connect to MongoDB
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('⚠️ No MONGO_URI or MONGODB_URI provided in env. Operating in LOCAL JSON FILE DATABASE mode.');
    useMongo = false;
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB successfully.');
    useMongo = true;
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection failed:', error.message);
    console.log('⚠️ Falling back to LOCAL JSON FILE DATABASE mode.');
    useMongo = false;
    return false;
  }
};

// Local JSON DB Helper
class LocalCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DB_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      return [];
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    let items = this.read();
    return this.filterItems(items, query);
  }

  async findOne(query = {}) {
    const items = this.read();
    const filtered = this.filterItems(items, query);
    return filtered.length > 0 ? filtered[0] : null;
  }

  async findById(id) {
    const items = this.read();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(doc) {
    const items = this.read();
    const newDoc = {
      _id: doc._id || Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    this.write(items);
    return newDoc;
  }

  parseUpdate(doc, update) {
    let newDoc = { ...doc };
    
    if (update.$set) {
      newDoc = { ...newDoc, ...update.$set };
    } else {
      const hasOperators = Object.keys(update).some(k => k.startsWith('$'));
      if (!hasOperators) {
        newDoc = { ...newDoc, ...update };
      }
    }
    
    if (update.$inc) {
      for (let key in update.$inc) {
        newDoc[key] = (newDoc[key] || 0) + update.$inc[key];
      }
    }
    
    if (update.$push) {
      for (let key in update.$push) {
        if (!Array.isArray(newDoc[key])) {
          newDoc[key] = [];
        }
        const pushVal = update.$push[key];
        if (pushVal && typeof pushVal === 'object' && '$each' in pushVal) {
          newDoc[key].push(...pushVal.$each);
        } else {
          newDoc[key].push(pushVal);
        }
      }
    }

    if (update.$pull) {
      for (let key in update.$pull) {
        if (Array.isArray(newDoc[key])) {
          const pullQuery = update.$pull[key];
          if (typeof pullQuery === 'object') {
            newDoc[key] = newDoc[key].filter(item => {
              for (let k in pullQuery) {
                if (item[k] !== pullQuery[k]) return true;
              }
              return false;
            });
          } else {
            newDoc[key] = newDoc[key].filter(item => item !== pullQuery);
          }
        }
      }
    }
    
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const items = this.read();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    const updatedDoc = {
      ...this.parseUpdate(items[index], update),
      updatedAt: new Date().toISOString()
    };
    items[index] = updatedDoc;
    this.write(items);
    return updatedDoc;
  }

  async findOneAndUpdate(query, update, options = { new: true }) {
    const items = this.read();
    const filtered = this.filterItems(items, query);
    
    if (filtered.length === 0) {
      if (options && options.upsert) {
        let newDoc = {
          _id: Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...query
        };
        newDoc = this.parseUpdate(newDoc, update);
        items.push(newDoc);
        this.write(items);
        return newDoc;
      }
      return null;
    }

    const matchedId = filtered[0]._id;
    const index = items.findIndex(item => item._id === matchedId);
    if (index === -1) return null;

    const updatedDoc = {
      ...this.parseUpdate(items[index], update),
      updatedAt: new Date().toISOString()
    };
    items[index] = updatedDoc;
    this.write(items);
    return updatedDoc;
  }

  async deleteOne(query) {
    const items = this.read();
    const filtered = this.filterItems(items, query);
    if (filtered.length === 0) return { deletedCount: 0 };

    const matchedId = filtered[0]._id;
    const remaining = items.filter(item => item._id !== matchedId);
    this.write(remaining);
    return { deletedCount: 1 };
  }

  async deleteMany(query) {
    const items = this.read();
    const beforeCount = items.length;
    const filtered = this.filterItems(items, query);
    const matchedIds = filtered.map(item => item._id);
    
    const remaining = items.filter(item => !matchedIds.includes(item._id));
    this.write(remaining);
    return { deletedCount: beforeCount - remaining.length };
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }

  filterItems(items, query) {
    return items.filter(item => {
      for (let key in query) {
        let val = query[key];
        
        // Handle MongoDB regex queries
        if (val && typeof val === 'object' && val.$regex) {
          const regex = new RegExp(val.$regex, val.$options || '');
          if (!regex.test(item[key])) return false;
          continue;
        }

        // Handle logical operators if any (simple implementation)
        if (val && typeof val === 'object' && ('$in' in val)) {
          if (!val.$in.includes(item[key])) return false;
          continue;
        }
        
        if (key === '$or' && Array.isArray(val)) {
          if (!val.some(q => this.filterItems([item], q).length > 0)) return false;
          continue;
        }

        if (item[key] !== val) return false;
      }
      return true;
    });
  }
}

// Wrapper function to expose Mongoose or Local JSON DB models
const getModel = (name, mongooseSchema) => {
  const localColl = new LocalCollection(name);

  // Return a proxy that intercepts calls
  return new Proxy({}, {
    get: (target, prop) => {
      if (useMongo) {
        // Fallback to Mongoose
        let mongoModel;
        try {
          mongoModel = mongoose.model(name);
        } catch (e) {
          mongoModel = mongoose.model(name, mongooseSchema);
        }
        return mongoModel[prop];
      } else {
        // Local JSON collection
        return localColl[prop].bind(localColl);
      }
    }
  });
};

const isValidId = (id) => {
  if (!id) return false;
  if (useMongo) {
    return mongoose.Types.ObjectId.isValid(id);
  }
  return typeof id === 'string' && id.trim().length > 0;
};

module.exports = {
  connectDB,
  getModel,
  isMongoConnected: () => useMongo,
  isValidId
};
