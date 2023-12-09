

// socket error handler
const withErrorHandler = async function (...args) {
  try {
    await this(...args);
  } catch (error) {
    console.log("ERROR IN SOCKET HANDLER => ", error);
    throw error;
  }
};

const handledSetTimeout = (callback, timeout) => {
  setTimeout(async () => {
    try {
      await callback();
    } catch (error) {
      console.log("ERROR IN SET TIMEOUT => ", error);
      throw error;
    }
  }, timeout)
};

module.exports = {
  handledSetTimeout,
  withErrorHandler,
};