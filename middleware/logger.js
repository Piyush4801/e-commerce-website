const getMiddlewareStack = (app) => {
  if (!app || !app._router || !app._router.stack) return [];
  const list = [];
  app._router.stack.forEach(layer => {
    if (layer.name === 'router') {
      list.push(`Router (regexp: ${layer.regexp})`);
      if (layer.handle && layer.handle.stack) {
        layer.handle.stack.forEach(sub => {
          if (sub.route) {
            const methods = Object.keys(sub.route.methods).join(',').toUpperCase();
            list.push(`  └─ Route: [${methods}] ${sub.route.path}`);
            if (sub.route.stack) {
              sub.route.stack.forEach(handler => {
                list.push(`      └─ Handler: ${handler.name || 'anonymous'}`);
              });
            }
          } else {
            list.push(`  └─ Middleware: ${sub.name || 'anonymous'}`);
          }
        });
      }
    } else if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      list.push(`Route: [${methods}] ${layer.route.path}`);
    } else {
      list.push(`Middleware: ${layer.name || 'anonymous'}`);
    }
  });
  return list;
};

const requestLogger = (req, res, next) => {
  const originalJson = res.json;
  const originalSend = res.send;
  const startTime = Date.now();

  let responseBody;
  res.json = function (body) {
    responseBody = body;
    return originalJson.apply(res, arguments);
  };
  res.send = function (body) {
    responseBody = body;
    return originalSend.apply(res, arguments);
  };

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.user ? req.user._id.toString() : 'guest';
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.originalUrl || req.url,
      userId,
      duration: `${duration}ms`,
      status: res.statusCode,
      requestBody: req.body
    };

    if (res.statusCode >= 400 || req.error) {
      logData.response = responseBody;
      const error = req.error;
      let errMsg = 'Unknown error';
      if (error) {
        errMsg = error.message;
      } else if (responseBody) {
        if (typeof responseBody === 'object') {
          errMsg = responseBody.error || responseBody.message || 'Unknown error';
        } else if (typeof responseBody === 'string') {
          try {
            const parsed = JSON.parse(responseBody);
            errMsg = parsed.error || parsed.message || 'Unknown error';
          } catch (e) {
            errMsg = responseBody;
          }
        }
      }
      logData.errorMessage = errMsg;
      logData.stackTrace = error ? error.stack : null;
      
      console.error(`[API ERROR LOG]`, JSON.stringify(logData, null, 2));
      
      // Detailed Debug Printing as requested
      console.error(`====================================================`);
      console.error(`DEBUG LOG: Failed Request Details`);
      console.error(`Request URL: ${req.method} ${req.originalUrl || req.url}`);
      console.error(`Request Body:`, JSON.stringify(req.body, null, 2));
      console.error(`Response Error:`, logData.errorMessage || 'Unknown error');
      console.error(`Middleware Stack:`);
      try {
        const stack = getMiddlewareStack(req.app);
        if (stack.length > 0) {
          stack.forEach(line => console.error(`  ${line}`));
        } else {
          console.error(`  (No middleware stack found or app router uninitialized)`);
        }
      } catch (err) {
        console.error(`  Error printing middleware stack: ${err.message}`);
      }
      console.error(`====================================================`);
    } else {
      console.log(`[API REQUEST LOG] ${req.method} ${logData.route} - Status: ${res.statusCode} - User: ${userId} - Time: ${duration}ms`);
    }
  });

  next();
};

module.exports = requestLogger;
