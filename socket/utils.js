

// socket error handler
const withErrorHandler = async function (...args) {
  try {
    console.log(this);
    await this(...args);
  } catch (error) {
    console.log("ERROR IN SOCKET HANDLER => ", error);
    // errorLogger.log({ level: "error", timestamp: new Date(), message: { title: error.message } });
    throw error;
  }
};

const handledSetTimeout = (callback, timeout) => {
  setTimeout(async () => {
    try {
      await callback();
    } catch (error) {
      console.log("ERROR IN SET TIMEOUT => ", error);
      // errorLogger.log({ level: "error", timestamp: new Date(), message: { title: error.message } });
    }
  }, timeout)
};

module.exports = {
  handledSetTimeout,
  withErrorHandler,
};