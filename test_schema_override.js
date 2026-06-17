const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  name: String
});

// Override it to String with a default generator
TestSchema.add({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  }
});

const TestModel = mongoose.model('Test', TestSchema);

// Test with provided ID
const item1 = new TestModel({ _id: 'custom_id_123', name: 'Custom ID Item' });
console.log('Item 1 ID:', item1._id);

// Test with auto-generated ID
const item2 = new TestModel({ name: 'Auto ID Item' });
console.log('Item 2 ID:', item2._id);
console.log('Item 2 ID type:', typeof item2._id);
