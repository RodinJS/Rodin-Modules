const httpStatus = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range not Satisfiable',
  417: 'Expectation Failed',
  422: 'Unprocessable Entity',
  424: 'Failed Dependency',
  429: 'Too Many Requests',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Time-out',
  505: 'HTTP Version not Supported',
  507: 'Insufficient Storage',

  600: 'Bad socket Request',
  605: 'Socket action complete',
  606: 'Socket action failed',
  607: 'Socket action in progress',

  309: "PROJECT_EXIST",
  310: "WRONG_USERNAME_OR_PASSWORD",
  311: "EMAIL_EXISTS",
  312: "USER_WITH_ID_NOT_FOUND",
  313: "PROJECT_WITH_ID_NOT_FOUND",
  314: "ACCESS_TO_PROJECT_DENIED",
  315: "TOKEN_DOES_NOT_PROVIDED",
  316: "UNKNOWN_TOKEN",
  317: "ORGANIZATION_NOT_FOUND",
  318: "EMAIL_SEND_ERROR",
  319: "USER_WITH_EMAIL_NOT_FOUND",
  320: "UNKNOWN_RESET_PASSWORD_CODE",
  321: "USER_WITH_USERNAME_NOT_FOUND",
  322: "INVALID_PASSWORD",
  323: "ORGANIZATION_PERMISSION_DENIED",
  324: "ADMIN_PERMISSION_REQUIRED",
  325: "USER_ALREADY_IN_ORGANIZATION",
  326: "ADD_YOURSELF_TO_YOUR_ORGANIZATION",
  327: "SOMETHING_WENT_WRONG",
  328: "COULD_NOT_DELETE_OBJECT",
  329: "COULD_NOT_LIST_FILES",
  330: "COULD_NOT_READ_FILE",
  331: "COULD_NOT_CREATE_COPY",
  332: "PATH_DOES_NOT_EXIST",
  333: "FILE_DOES_NOT_EXIST",
  334: "FILE_ALREDY_EXIST",
  335: "FILE_OR_PATH_DOES_NOT_EXIST",
  336: "COULD_NOT_WRITE_TO_FILE",
  337: "COULD_NOT_CREATE_FILE",
  338: "NOT_A_FILE",
  350: "GITHUB_NOT_LINKED",
  351: "NO_PROJECT_ROOT",
  352: "REPO_NAME_EXIST",
  360: "NO_DOMAIN_NAME",
  361: "COULD_NOT_CREATE_TEMPLATE",
  362: "ERROR_IN_CONFIG_FILE",
  601: "UNKNOWN_SOCKET_CHANNEL",
  602: "UNKNOWN_SOCKET_ROOM",
  603: "PERMISSION_SOCKET_DENIED",
  604: "UNKNOWN_SOCKET_ACTION",
  666: "FATAL",


  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  UNPROCESSABLE_ENTITY: 422,
  FAILED_DEPENDENCY: 424,
  TOO_MANY_REQUESTS: 429,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  INSUFFICIENT_STORAGE: 507,
// custom status codes for RODIN
  PROJECT_EXIST: 309,
  WRONG_USERNAME_OR_PASSWORD: 310,
  EMAIL_EXISTS: 311,
  USER_WITH_ID_NOT_FOUND: 312,
  PROJECT_WITH_ID_NOT_FOUND: 313,
  ACCESS_TO_PROJECT_DENIED: 314,
  TOKEN_DOES_NOT_PROVIDED: 315,
  UNKNOWN_TOKEN: 316,
  ORGANIZATION_NOT_FOUND: 317,
  EMAIL_SEND_ERROR: 318,
  USER_WITH_EMAIL_NOT_FOUND: 319,
  UNKNOWN_RESET_PASSWORD_CODE: 320,
  USER_WITH_USERNAME_NOT_FOUND: 321,
  INVALID_PASSWORD: 322,
  ORGANIZATION_PERMISSION_DENIED: 323,
  ADMIN_PERMISSION_REQUIRED: 324,
  USER_ALREADY_IN_ORGANIZATION: 325,
  ADD_YOURSELF_TO_YOUR_ORGANIZATION: 326,
  SOMETHING_WENT_WRONG: 327,
  NO_PROJECT_ID: 328,
// working with files [328-349]
  COULD_NOT_DELETE_OBJECT: 328,
  COULD_NOT_LIST_FILES: 329,
  COULD_NOT_READ_FILE: 330,
  COULD_NOT_CREATE_COPY: 331,
  PATH_DOES_NOT_EXIST: 332,
  FILE_DOES_NOT_EXIST: 333,
  FILE_ALREDY_EXIST: 334,
  FILE_OR_PATH_DOES_NOT_EXIST: 335,
  COULD_NOT_WRITE_TO_FILE: 336,
  COULD_NOT_CREATE_FILE: 337,
  NOT_A_FILE: 338,

// working with github [350-360]
  GITHUB_NOT_LINKED: 350,
  NO_PROJECT_ROOT: 351,
  REPO_NAME_EXIST: 352,
// working with custom domain names [360-370]
  NO_DOMAIN_NAME: 360,
  COULD_NOT_CREATE_TEMPLATE: 361,
  ERROR_IN_CONFIG_FILE: 362,

// working with sockets [600~]
  BAD_SOCKET_REQUEST: 600,
  BAD_SOCKET_CHANNEL: 601,
  UNKNOWN_SOCKET_CHANNEL: 601,
  UNKNOWN_SOCKET_ROOM: 602,
  PERMISSION_SOCKET_DENIED: 603,
  UNKNOWN_SOCKET_ACTION: 604,
  SOCKET_ACTION_COMPLETE: 605,
  SOCKET_ACTION_FAILED: 606,
  SOCKET_ACTION_IN_PROGRESS: 607,

// fatal [666]
  FATAL: 666

};

export default httpStatus;
