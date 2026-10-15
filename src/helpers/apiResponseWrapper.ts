export function success (statusCode: Number, result: any) {
    return {
      success: true,
      statusCode,
      result,
    };
  };
  
export function error(statusCode: Number, message: any, result?: any) {
    return {
      success: false,
      message,
      statusCode,
      result,
    }
  };