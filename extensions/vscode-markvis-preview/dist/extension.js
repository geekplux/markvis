"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description: description2 } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description: description2 };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description: description2 };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description2) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description: description2
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// ../../packages/ir/src/index.ts
var CHART_TYPES = [
  "bar",
  "line",
  "area",
  "scatter",
  "pie",
  "hist"
];
var ChartTypeSchema = external_exports.enum(CHART_TYPES);
var TableSchema = external_exports.object({
  columns: external_exports.array(external_exports.string()).min(1),
  rows: external_exports.array(external_exports.array(external_exports.string())).min(1)
}).strict();
var ChartIRSchema = external_exports.object({
  markvis: external_exports.literal(2),
  type: ChartTypeSchema,
  title: external_exports.string().min(1),
  unit: external_exports.string().min(1).optional(),
  x: external_exports.string().min(1),
  y: external_exports.string().min(1).optional(),
  series: external_exports.string().min(1).optional(),
  table: TableSchema
}).strict().superRefine((val, ctx) => {
  if (val.type !== "hist" && val.y === void 0) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "y is required unless type is hist",
      path: ["y"]
    });
  }
  if (!val.table.columns.includes(val.x)) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "x must name a table column",
      path: ["x"]
    });
  }
  if (val.y !== void 0 && !val.table.columns.includes(val.y)) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "y must name a table column",
      path: ["y"]
    });
  }
  if (val.series !== void 0 && !val.table.columns.includes(val.series)) {
    ctx.addIssue({
      code: external_exports.ZodIssueCode.custom,
      message: "series must name a table column",
      path: ["series"]
    });
  }
});
function isChartType(value) {
  return CHART_TYPES.includes(value);
}
function columnValues(table, name) {
  const index = table.columns.indexOf(name);
  if (index === -1) {
    return [];
  }
  return table.rows.map((row) => row[index] ?? "");
}

// ../../packages/parser/src/extract.ts
var FENCE_RE = /^```(chart|markvis|vis)[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;
var COMMENT_RE = /<!--\s*(chart|markvis|vis)\s*:\s*([\s\S]*?)-->/gi;
function parseCommentInner(inner) {
  const trimmed = inner.trim();
  const typeMatch = trimmed.match(/^([A-Za-z0-9_-]+)/);
  const type = typeMatch?.[1] ?? "";
  const rest = typeMatch ? trimmed.slice(typeMatch[0].length) : trimmed;
  const attrs2 = {};
  const attrRe = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:"([^"]*)"|(\S+))/g;
  let match;
  while ((match = attrRe.exec(rest)) !== null) {
    const key = match[1];
    attrs2[key] = match[2] ?? match[3] ?? "";
  }
  return { type, attrs: attrs2 };
}
function readGfmAfter(source, start) {
  const after = source.slice(start).replace(/^[ \t]*\r?\n/, "");
  const lines = after.split(/\r?\n/);
  const tableLines = [];
  for (const line of lines) {
    if (line.trim().startsWith("|")) {
      tableLines.push(line);
      continue;
    }
    if (tableLines.length === 0 && line.trim() === "") {
      continue;
    }
    break;
  }
  return tableLines.join("\n");
}
function headersToBody(type, attrs2, gfm) {
  const lines = [`type: ${type}`];
  for (const [key, value] of Object.entries(attrs2)) {
    lines.push(`${key}: ${value}`);
  }
  return `${lines.join("\n")}

${gfm}`;
}
function extractCharts(source) {
  const found = [];
  FENCE_RE.lastIndex = 0;
  let match;
  while ((match = FENCE_RE.exec(source)) !== null) {
    found.push({
      index: match.index,
      lang: match[1].toLowerCase(),
      form: "fence",
      body: match[2] ?? "",
      raw: match[0]
    });
  }
  COMMENT_RE.lastIndex = 0;
  while ((match = COMMENT_RE.exec(source)) !== null) {
    const lang = match[1].toLowerCase();
    const inner = match[2] ?? "";
    const end = match.index + match[0].length;
    const gfm = readGfmAfter(source, end);
    const { type, attrs: attrs2 } = parseCommentInner(inner);
    found.push({
      index: match.index,
      lang,
      form: "comment",
      body: headersToBody(type, attrs2, gfm),
      raw: gfm ? `${match[0]}
${gfm}` : match[0]
    });
  }
  found.sort((a, b) => a.index - b.index);
  return found;
}

// ../../packages/parser/src/table.ts
function isNumericString(value) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return false;
  }
  return Number.isFinite(Number(trimmed));
}
function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  let wasQuoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
          continue;
        }
        quoted = false;
        continue;
      }
      current += ch;
      continue;
    }
    if (ch === '"') {
      quoted = true;
      wasQuoted = true;
      continue;
    }
    if (ch === ",") {
      cells.push(wasQuoted ? current : current.trim());
      current = "";
      wasQuoted = false;
      continue;
    }
    current += ch;
  }
  cells.push(wasQuoted ? current : current.trim());
  return cells;
}
function splitNonEmptyLines(text) {
  return text.split(/\r?\n/).filter((line) => line.trim() !== "");
}
function parseCsv(text) {
  const lines = splitNonEmptyLines(text);
  if (lines.length === 0) {
    return { columns: [], rows: [] };
  }
  const columns = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => parseCsvLine(line));
  return { columns, rows };
}
function parseCsvRows(text) {
  return splitNonEmptyLines(text).map((line) => parseCsvLine(line));
}
function splitGfmRow(line) {
  let inner = line.trim();
  if (inner.startsWith("|")) {
    inner = inner.slice(1);
  }
  if (inner.endsWith("|")) {
    inner = inner.slice(0, -1);
  }
  return inner.split("|").map((cell) => cell.trim());
}
function isGfmSeparatorLine(line) {
  const cells = splitGfmRow(line);
  if (cells.length === 0) {
    return false;
  }
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}
function looksLikeGfm(text) {
  const first = splitNonEmptyLines(text)[0];
  return first !== void 0 && first.trim().startsWith("|");
}
function parseGfm(text) {
  const lines = splitNonEmptyLines(text);
  if (lines.length === 0) {
    return { columns: [], rows: [] };
  }
  const columns = splitGfmRow(lines[0]);
  let start = 1;
  if (lines[1] !== void 0 && isGfmSeparatorLine(lines[1])) {
    start = 2;
  }
  const rows = lines.slice(start).map((line) => splitGfmRow(line));
  return { columns, rows };
}
function hasDuplicateColumns(columns) {
  return new Set(columns).size !== columns.length;
}
function hasWidthMismatch(columns, rows) {
  return rows.some((row) => row.length !== columns.length);
}
function columnIsNumeric(table, colIndex) {
  let seen = false;
  for (const row of table.rows) {
    const cell = row[colIndex];
    if (cell === void 0 || cell.trim() === "") {
      continue;
    }
    if (!isNumericString(cell)) {
      return false;
    }
    seen = true;
  }
  return seen;
}

// ../../packages/parser/src/parse.ts
var EMPTY_TABLE = { columns: [], rows: [] };
function fail(code, detail, table, raw) {
  return {
    ok: false,
    error: { code, message: `${code}: ${detail}` },
    table,
    raw
  };
}
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from(
    { length: m + 1 },
    () => Array.from({ length: n + 1 }, () => 0)
  );
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}
function classifyType(type) {
  if (isChartType(type)) {
    return "ok";
  }
  const near = CHART_TYPES.some((known) => levenshtein(type, known) === 1);
  return near ? "typo" : "unknown";
}
function splitHeaderAndData(body) {
  const lines = body.split(/\r?\n/);
  const headers = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      i += 1;
      break;
    }
    const match = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*?)\s*$/);
    if (!match) {
      break;
    }
    headers[match[1]] = match[2];
  }
  return { headers, data: lines.slice(i).join("\n") };
}
function looksLikeJson(text) {
  const trimmed = text.trim();
  return trimmed.startsWith("[") || trimmed.startsWith("{");
}
function looksLikeMissingCsvHeader(columns, headers) {
  if (columns.length === 0) {
    return false;
  }
  if (!columns.some((cell) => isNumericString(cell))) {
    return false;
  }
  const mapped = [headers["x"], headers["y"], headers["series"]].filter(
    (name) => Boolean(name)
  );
  if (mapped.length === 0) {
    return true;
  }
  return mapped.some((name) => !columns.includes(name));
}
function recoverUnheadedCsv(data, headers) {
  const rows = parseCsvRows(data);
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const columns = [];
  const x = headers["x"];
  const y = headers["y"];
  const series = headers["series"];
  for (let i = 0; i < width; i++) {
    if (i === 0 && x) {
      columns.push(x);
    } else if (i === 1 && y) {
      columns.push(y);
    } else if (i === 2 && series) {
      columns.push(series);
    } else {
      columns.push(`col${i + 1}`);
    }
  }
  return { columns, rows };
}
function firstNumericColumn(table, exclude) {
  for (let i = 0; i < table.columns.length; i++) {
    const name = table.columns[i];
    if (exclude !== void 0 && name === exclude) {
      continue;
    }
    if (columnIsNumeric(table, i)) {
      return name;
    }
  }
  return void 0;
}
function firstCategoryColumn(table) {
  for (let i = 0; i < table.columns.length; i++) {
    const name = table.columns[i];
    if (!columnIsNumeric(table, i)) {
      return name;
    }
  }
  return void 0;
}
function inferX(type, table) {
  if (type === "scatter" || type === "hist") {
    return firstNumericColumn(table) ?? table.columns[0];
  }
  if (type === "bar" || type === "pie") {
    return firstCategoryColumn(table) ?? table.columns[0];
  }
  return table.columns[0];
}
function inferY(type, table, x) {
  const numeric = firstNumericColumn(table, x);
  if (type === "hist") {
    return numeric;
  }
  if (numeric) {
    return numeric;
  }
  return table.columns.find((name) => name !== x);
}
function basename(filename) {
  const parts = filename.split(/[/\\]/);
  return parts[parts.length - 1] ?? filename;
}
function deriveTitle(opts) {
  if (opts.filename) {
    const base = basename(opts.filename).replace(/\.md$/i, "");
    const rest = base.replace(/^\d+-/, "").replace(/-/g, " ").trim();
    if (rest) {
      return rest;
    }
  }
  if (opts.y) {
    return opts.y;
  }
  if (opts.firstColumn) {
    return opts.firstColumn;
  }
  return "chart";
}
function buildIR(fields) {
  return ChartIRSchema.parse({
    markvis: 2,
    type: fields.type,
    title: fields.title,
    x: fields.x,
    table: fields.table,
    ...fields.unit ? { unit: fields.unit } : {},
    ...fields.y ? { y: fields.y } : {},
    ...fields.series && fields.type !== "pie" && fields.type !== "hist" ? { series: fields.series } : {}
  });
}
function parseBody(body, opts) {
  const raw = opts.raw;
  if (body.trim() === "") {
    return fail("E_EMPTY_FENCE", "fence body empty", EMPTY_TABLE, raw);
  }
  const { headers, data } = splitHeaderAndData(body);
  const dataTrim = data.trim();
  if (dataTrim === "") {
    return fail(
      "E_EMPTY_DATA",
      "header only, or zero data rows",
      EMPTY_TABLE,
      raw
    );
  }
  if (looksLikeJson(dataTrim)) {
    return fail(
      "E_JSON_DATA",
      "data body is JSON; use CSV or a GFM table",
      { columns: ["_raw"], rows: [[dataTrim]] },
      raw
    );
  }
  const parsed = looksLikeGfm(dataTrim) ? parseGfm(dataTrim) : parseCsv(dataTrim);
  if (!looksLikeGfm(dataTrim) && looksLikeMissingCsvHeader(parsed.columns, headers)) {
    const recovered = recoverUnheadedCsv(dataTrim, headers);
    return fail(
      "E_MISSING_HEADER",
      "no CSV/GFM header row",
      recovered,
      raw
    );
  }
  if (parsed.columns.length === 0) {
    return fail(
      "E_MISSING_HEADER",
      "no CSV/GFM header row",
      EMPTY_TABLE,
      raw
    );
  }
  if (hasDuplicateColumns(parsed.columns)) {
    return fail(
      "E_DUP_COLUMN",
      "duplicate header names",
      parsed,
      raw
    );
  }
  if (hasWidthMismatch(parsed.columns, parsed.rows)) {
    return fail(
      "E_EXTRA_COLUMN",
      "row width does not match header width",
      parsed,
      raw
    );
  }
  if (parsed.rows.length === 0) {
    return fail(
      "E_EMPTY_DATA",
      "header only, or zero data rows",
      parsed,
      raw
    );
  }
  const typeRaw = (headers["type"] ?? "").trim();
  const typeKind = classifyType(typeRaw);
  if (typeKind === "typo") {
    return fail(
      "E_TYPE_TYPO",
      "type looks like a misspelling of a known type",
      parsed,
      raw
    );
  }
  if (typeKind === "unknown") {
    return fail(
      "E_UNKNOWN_TYPE",
      "type is not one of bar|line|area|scatter|pie|hist",
      parsed,
      raw
    );
  }
  const type = typeRaw;
  const specified = {
    x: headers["x"]?.trim() || void 0,
    y: headers["y"]?.trim() || void 0,
    series: headers["series"]?.trim() || void 0
  };
  const mapped = [specified.x, specified.y, specified.series].filter(
    (name) => Boolean(name)
  );
  const missing = mapped.filter((name) => !parsed.columns.includes(name));
  if (missing.length > 0) {
    if (opts.form === "comment") {
      return fail(
        "E_YAML_TABLE_CONFLICT",
        "comment fields disagree with table columns",
        parsed,
        raw
      );
    }
    return fail(
      "E_UNKNOWN_FIELD",
      "x, y, or series names a missing column",
      parsed,
      raw
    );
  }
  const x = specified.x ?? inferX(type, parsed);
  const y = specified.y ?? inferY(type, parsed, x);
  const series = specified.series && type !== "pie" && type !== "hist" ? specified.series : void 0;
  if (type !== "hist" && !y) {
    return fail(
      "E_UNKNOWN_FIELD",
      "x, y, or series names a missing column",
      parsed,
      raw
    );
  }
  if (type === "pie" && y) {
    const yIndex = parsed.columns.indexOf(y);
    const negative = parsed.rows.some((row) => {
      const cell = row[yIndex];
      if (cell === void 0 || !isNumericString(cell)) {
        return false;
      }
      return Number(cell) < 0;
    });
    if (negative) {
      return fail("E_PIE_NEGATIVE", "pie values must be >= 0", parsed, raw);
    }
  }
  const title = headers["title"]?.trim() || deriveTitle({
    filename: opts.filename,
    y,
    firstColumn: parsed.columns[0]
  });
  const unit = headers["unit"]?.trim() || void 0;
  const chart = buildIR({
    type,
    title,
    unit,
    x,
    y,
    series,
    table: parsed
  });
  return { ok: true, chart };
}
function parseMarkdown(source, options = {}) {
  const charts = extractCharts(source);
  const first = charts[0];
  if (!first) {
    return fail("E_EMPTY_FENCE", "fence body empty", EMPTY_TABLE, source);
  }
  return parseBody(first.body, {
    form: first.form,
    filename: options.filename,
    raw: first.raw
  });
}

// ../../packages/render-svg/src/data.ts
function uniqueInOrder(values) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}
function parseOptionalNumber(raw) {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return void 0;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : void 0;
}
function loadRows(chart) {
  const xValues = columnValues(chart.table, chart.x);
  const yValues = chart.y === void 0 ? void 0 : columnValues(chart.table, chart.y);
  const seriesValues = chart.series === void 0 ? void 0 : columnValues(chart.table, chart.series);
  const fallbackSeries = chart.y ?? "value";
  const rows = [];
  for (let i = 0; i < xValues.length; i++) {
    const xLabel = xValues[i] ?? "";
    const yRaw = yValues ? yValues[i] ?? "" : "1";
    const yParsed = Number(yRaw.trim());
    rows.push({
      xLabel,
      xNum: parseOptionalNumber(xLabel),
      y: Number.isFinite(yParsed) ? yParsed : 0,
      series: seriesValues ? seriesValues[i] ?? "" : fallbackSeries
    });
  }
  return rows;
}
function seriesNames(rows) {
  return uniqueInOrder(rows.map((row) => row.series));
}
function categoryNames(rows) {
  return uniqueInOrder(rows.map((row) => row.xLabel));
}
function usesLinearX(chart, rows) {
  if (chart.type === "scatter" || chart.type === "hist") {
    return true;
  }
  if (chart.type === "bar" || chart.type === "pie") {
    return false;
  }
  return rows.length > 0 && rows.every((row) => row.xNum !== void 0);
}
function groupedValue(rows, series, category) {
  let found;
  for (const row of rows) {
    if (row.series === series && row.xLabel === category) {
      found = row.y;
    }
  }
  return found ?? 0;
}

// ../../packages/render-svg/src/tokens.ts
var SVG_WIDTH = 720;
var SVG_HEIGHT = 480;
var SVG_HEIGHT_MAX = 640;
var PLOT_MIN_RATIO = 0.55;
var FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
var INK = "#171717";
var QUIET = "#737373";
var HAIRLINE_OPACITY = "0.10";
var STRUCTURE_OPACITY = "0.28";
var TYPE = {
  title: { size: 17, weight: 600, fill: INK },
  unit: { size: 12, weight: 400, fill: QUIET },
  value: { size: 11, weight: 500, fill: INK },
  tick: { size: 10, weight: 400, fill: QUIET },
  note: { size: 11, weight: 400, fill: QUIET },
  legend: { size: 11, weight: 400, fill: INK }
};
var MARGIN = {
  top: 36,
  right: 20,
  bottom: 26,
  left: 48
};
var PALETTE = [
  "#3B82F6",
  "#F97316",
  "#10B981",
  "#A855F7",
  "#EAB308",
  "#14B8A6",
  "#F43F5E",
  "#64748B"
];
var WRAP_OPACITY = 0.7;
var TITLE_BASELINE = 24;
var TITLE_TO_PLOT = 12;
var TICK_TEXT_GAP = 10;
var LABEL_ROTATE_DEG = -55;
var LABEL_MIN_GAP = 2;
var ROTATE_LINE_HEIGHT = 12;
var MAX_INTERIOR_GRID = 3;
var BAR_GAP_FEW = 0.28;
var BAR_GAP_MANY = 0.18;
var GROUP_GAP_PX = 2;
var BAR_RX = 3;
var BAR_MAX_WIDTH = 72;
var BAR_MAX_WIDTH_N = 4;
var BAR_LABEL_MIN_WIDTH = 14;
var BAR_LABEL_INSIDE_H = 28;
var BAR_LABEL_OFFSET = 8;
var BAR_LABEL_N_ON = 6;
var BAR_LABEL_N_OFF = 8;
var BAR_LABEL_MID_MIN_W = 18;
var LINE_STROKE = 1.75;
var LINE_POINT_R = 2.5;
var POINT_SKIP_AFTER = 40;
var AREA_OPACITY = 0.22;
var END_LABEL_SERIES_MAX = 4;
var END_LABEL_GAP = 8;
var END_LABEL_MIN_SEP = 14;
var SCATTER_R = 3;
var SCATTER_OPACITY = 0.85;
var PIE_RADIUS_RATIO = 0.34;
var PIE_STROKE = 1.5;
var PIE_LEADER = 16;
var PIE_LABEL_GAP = 12;
var PIE_LABEL_MIN_SEP = 14;
var PIE_ELBOW = 8;
var COMPACT_SPAN = 1e4;

// ../../packages/render-svg/src/xml.ts
var import_node_crypto = require("node:crypto");
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function canonicalJson(chart) {
  return JSON.stringify({
    markvis: chart.markvis,
    type: chart.type,
    title: chart.title,
    unit: chart.unit ?? "",
    x: chart.x,
    y: chart.y ?? "",
    series: chart.series ?? "",
    columns: chart.table.columns,
    rows: chart.table.rows
  });
}
function chartId(chart) {
  const hash = (0, import_node_crypto.createHash)("sha256").update(canonicalJson(chart), "utf8").digest("hex").slice(0, 16);
  return `mv-${hash}`;
}
function fmtPx(n) {
  const rounded = Math.round(n * 100) / 100;
  const value = Object.is(rounded, -0) ? 0 : rounded;
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(value);
}
function attrs(record) {
  const parts = [];
  for (const [key, value] of Object.entries(record)) {
    if (value === void 0) {
      continue;
    }
    parts.push(`${key}="${escapeXml(String(value))}"`);
  }
  return parts.join(" ");
}

// ../../packages/render-svg/src/figure.ts
function visibleTitle(chart) {
  const title = chart.title.trim();
  if (title.length > 0) {
    return title;
  }
  return chart.y ?? "";
}
function drawTitle(title, x, unit) {
  const unitSpan = unit ? `<tspan font-size="${TYPE.unit.size}" font-weight="${TYPE.unit.weight}" fill="${TYPE.unit.fill}"> \xB7 ${escapeXml(unit)}</tspan>` : "";
  return `  <text ${attrs({
    x: fmtPx(x),
    y: TITLE_BASELINE,
    "text-anchor": "start",
    "font-size": TYPE.title.size,
    "font-weight": TYPE.title.weight,
    fill: TYPE.title.fill
  })}>${escapeXml(title)}${unitSpan}</text>`;
}

// ../../packages/render-svg/src/scale.ts
function cleanFloat(n) {
  if (!Number.isFinite(n)) {
    return 0;
  }
  const rounded = Number(n.toPrecision(12));
  return Object.is(rounded, -0) ? 0 : rounded;
}
function niceStep(rough) {
  if (!(rough > 0) || !Number.isFinite(rough)) {
    return 1;
  }
  const exp = Math.floor(Math.log10(rough));
  const pow = 10 ** exp;
  const frac = rough / pow;
  let niceFrac;
  if (frac <= 1) {
    niceFrac = 1;
  } else if (frac <= 2) {
    niceFrac = 2;
  } else if (frac <= 5) {
    niceFrac = 5;
  } else {
    niceFrac = 10;
  }
  return niceFrac * pow;
}
function niceTicks(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0, 1];
  }
  if (min > max) {
    return niceTicks(max, min, count);
  }
  if (min === max) {
    if (min === 0) {
      return [0, 1];
    }
    const pad = Math.abs(min) * 0.1 || 1;
    return niceTicks(min - pad, max + pad, count);
  }
  const span = max - min;
  const step = niceStep(span / Math.max(count - 1, 1));
  const startN = Math.floor(min / step);
  const endN = Math.ceil(max / step);
  const ticks = [];
  for (let i = startN; i <= endN; i++) {
    ticks.push(cleanFloat(i * step));
  }
  return ticks.length > 0 ? ticks : [min, max];
}
function scaleLinear(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const dSpan = d1 - d0;
  const rSpan = r1 - r0;
  return (value) => {
    if (dSpan === 0) {
      return (r0 + r1) / 2;
    }
    return r0 + (value - d0) / dSpan * rSpan;
  };
}
function withCommas(digits) {
  if (digits.length <= 3) {
    return digits;
  }
  const parts = [];
  for (let i = digits.length; i > 0; i -= 3) {
    parts.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return parts.join(",");
}
function formatNumber(n) {
  if (!Number.isFinite(n)) {
    return "";
  }
  if (Object.is(n, -0) || n === 0) {
    return "0";
  }
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (Math.abs(abs - Math.round(abs)) < 1e-9) {
    return sign + withCommas(String(Math.round(abs)));
  }
  const trimmed = trimFixed(abs);
  const dot = trimmed.indexOf(".");
  if (dot === -1) {
    return sign + withCommas(trimmed);
  }
  const intPart = trimmed.slice(0, dot);
  const frac = trimmed.slice(dot);
  return sign + (intPart.length > 3 ? withCommas(intPart) : intPart) + frac;
}
function compactScale(_ticks, _span) {
  void COMPACT_SPAN;
  return null;
}
function formatTick(n, compact) {
  if (compact) {
    return formatNumber(n / compact.divisor);
  }
  return formatNumber(n);
}
function unitWithCompact(unit, compact) {
  if (!compact) {
    return unit;
  }
  if (!unit) {
    return compact.suffix;
  }
  const trimmed = unit.trim();
  const parts = trimmed.split(/\s+/);
  const last = parts[parts.length - 1];
  if (last === compact.suffix) {
    return trimmed;
  }
  return `${trimmed} ${compact.suffix}`;
}
function trimFixed(n) {
  if (Math.abs(n - Math.round(n)) < 1e-9) {
    return String(Math.round(n));
  }
  return n.toFixed(2).replace(/\.?0+$/, "");
}
function yExtent(values, forceZero) {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) {
    return [0, 1];
  }
  let lo = Math.min(...finite);
  let hi = Math.max(...finite);
  if (forceZero) {
    if (lo > 0) {
      lo = 0;
    }
    if (hi < 0) {
      hi = 0;
    }
  }
  if (lo === hi) {
    if (lo === 0) {
      return [0, 1];
    }
    const pad = Math.abs(lo) * 0.1 || 1;
    return [lo - pad, hi + pad];
  }
  if (!forceZero) {
    const pad = (hi - lo) * 0.08;
    lo -= pad;
    hi += pad;
  }
  return [lo, hi];
}
function xExtent(values, padRatio) {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) {
    return [0, 1];
  }
  let lo = Math.min(...finite);
  let hi = Math.max(...finite);
  if (lo === hi) {
    return [lo - 1, hi + 1];
  }
  const pad = (hi - lo) * padRatio;
  return [lo - pad, hi + pad];
}

// ../../packages/render-svg/src/hist.ts
function binHistogram(samples) {
  if (samples.length === 0) {
    return [];
  }
  let vmin = samples[0].value;
  let vmax = samples[0].value;
  for (const sample of samples) {
    if (sample.value < vmin) {
      vmin = sample.value;
    }
    if (sample.value > vmax) {
      vmax = sample.value;
    }
  }
  if (vmin === vmax) {
    let weight = 0;
    for (const sample of samples) {
      weight += sample.weight;
    }
    return [
      {
        left: cleanFloat(vmin - 0.5),
        right: cleanFloat(vmax + 0.5),
        weight,
        count: samples.length
      }
    ];
  }
  const n = samples.length;
  const k = Math.min(20, Math.max(1, Math.ceil(Math.log2(n) + 1)));
  const width = (vmax - vmin) / k;
  const bins = [];
  for (let i = 0; i < k; i++) {
    bins.push({
      left: cleanFloat(vmin + i * width),
      right: cleanFloat(vmin + (i + 1) * width),
      weight: 0,
      count: 0
    });
  }
  for (const sample of samples) {
    let index = Math.floor((sample.value - vmin) / width);
    if (index < 0) {
      index = 0;
    }
    if (index >= k) {
      index = k - 1;
    }
    const bin = bins[index];
    bin.weight += sample.weight;
    bin.count += 1;
  }
  return bins;
}
function histSamplesFromChart(chart) {
  const xValues = columnValues(chart.table, chart.x);
  const yValues = chart.y === void 0 ? void 0 : columnValues(chart.table, chart.y);
  const samples = [];
  for (let i = 0; i < xValues.length; i++) {
    const value = Number((xValues[i] ?? "").trim());
    if (!Number.isFinite(value)) {
      continue;
    }
    let weight = 1;
    if (yValues) {
      const parsed = Number((yValues[i] ?? "").trim());
      weight = Number.isFinite(parsed) ? parsed : 0;
    }
    samples.push({ value, weight });
  }
  return samples;
}

// ../../packages/render-svg/src/text.ts
function textWidth(text, fontSize) {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const em = code > 11904 ? 1 : 0.62;
    width += fontSize * em;
  }
  return width;
}

// ../../packages/render-svg/src/layout.ts
function layoutLegend(names, colors, opacities, left, top, maxWidth) {
  const items = [];
  let x = left;
  let y = top;
  let rowHeight = 16;
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const width = 16 + textWidth(name, TYPE.legend.size) + 14;
    if (i > 0 && x + width > left + maxWidth) {
      x = left;
      y += 18;
    }
    items.push({
      name,
      color: colors[i] ?? PALETTE[0],
      opacity: opacities[i] ?? 1,
      x,
      y
    });
    x += width;
    rowHeight = y - top + 16;
  }
  return { items, height: names.length === 0 ? 0 : rowHeight };
}
function labelsOverlapZero(widths, catStep) {
  if (widths.length === 0) {
    return false;
  }
  for (const width of widths) {
    if (width > catStep - LABEL_MIN_GAP) {
      return true;
    }
  }
  for (let i = 0; i < widths.length - 1; i++) {
    const needed = widths[i] / 2 + widths[i + 1] / 2 + LABEL_MIN_GAP;
    if (needed > catStep) {
      return true;
    }
  }
  return false;
}
function labelsOverlapRotated(catStep) {
  const rad = Math.abs(LABEL_ROTATE_DEG) * Math.PI / 180;
  return catStep * Math.sin(rad) < ROTATE_LINE_HEIGHT;
}
function categoryLayout(labels, catStep) {
  const showAll = labels.map(() => true);
  if (labels.length <= 1) {
    const width = labels[0] ? textWidth(labels[0], TYPE.tick.size) : 0;
    if (width > catStep - LABEL_MIN_GAP && labels.length === 1) {
      return { rotate: true, show: showAll };
    }
    return { rotate: false, show: showAll };
  }
  const widths = labels.map((label) => textWidth(label, TYPE.tick.size));
  if (!labelsOverlapZero(widths, catStep)) {
    return { rotate: false, show: showAll };
  }
  if (!labelsOverlapRotated(catStep)) {
    return { rotate: true, show: showAll };
  }
  return {
    rotate: true,
    show: labels.map((_, i) => i % 2 === 0)
  };
}
function tickLeftMargin(yTickLabels) {
  const yTickWidth = Math.max(
    0,
    ...yTickLabels.map((label) => textWidth(label, TYPE.tick.size))
  );
  return Math.max(MARGIN.left, yTickWidth + TICK_TEXT_GAP);
}
function categoryBottomMargin(labels, rotate) {
  if (labels.length === 0) {
    return TYPE.tick.size + 12;
  }
  if (rotate) {
    const longest = Math.max(
      0,
      ...labels.map((label) => textWidth(label, TYPE.tick.size))
    );
    const rad = Math.abs(LABEL_ROTATE_DEG) * Math.PI / 180;
    return Math.sin(rad) * longest + 12;
  }
  return TYPE.tick.size + 12;
}
function titleBlockTop(legendHeight) {
  if (legendHeight > 0) {
    return TITLE_BASELINE + 8 + legendHeight + TITLE_TO_PLOT;
  }
  return TITLE_BASELINE + TITLE_TO_PLOT;
}
function fitFrameHeight(top, bottom) {
  const chrome = top + bottom;
  const needed = chrome / (1 - PLOT_MIN_RATIO);
  const rounded = Math.ceil(needed);
  return Math.min(SVG_HEIGHT_MAX, Math.max(SVG_HEIGHT, rounded));
}
function layoutFrame(opts) {
  const width = SVG_WIDTH;
  const left = tickLeftMargin(opts.yTickLabels);
  const right = Math.max(MARGIN.right, opts.rightMin ?? MARGIN.right);
  const top = titleBlockTop(opts.legendHeight);
  const draftW = Math.max(width - left - right, 1);
  const nCat = Math.max(opts.categoryLabels.length, 1);
  const catLay = opts.categoryLabels.length > 0 ? categoryLayout(opts.categoryLabels, draftW / nCat) : { rotate: false, show: [] };
  const bottom = categoryBottomMargin(opts.categoryLabels, catLay.rotate);
  const height = fitFrameHeight(top, bottom);
  const plot = {
    left,
    right: width - right,
    top,
    bottom: height - bottom,
    width: width - left - right,
    height: height - top - bottom
  };
  return {
    width,
    height,
    plot,
    rotateX: catLay.rotate,
    show: catLay.show,
    left,
    right,
    top,
    bottom
  };
}
function showBarValueLabels(nCat, barWidth) {
  if (barWidth < BAR_LABEL_MIN_WIDTH) {
    return false;
  }
  if (nCat <= BAR_LABEL_N_ON) {
    return true;
  }
  if (nCat > BAR_LABEL_N_OFF) {
    return false;
  }
  return barWidth >= BAR_LABEL_MID_MIN_W;
}

// ../../packages/render-svg/src/palette.ts
function seriesStyle(index) {
  const color = PALETTE[index % PALETTE.length];
  const opacity = index < PALETTE.length ? 1 : WRAP_OPACITY;
  return { color, opacity };
}

// ../../packages/render-svg/src/cartesian.ts
function polyline(points) {
  return points.map((point, i) => {
    const cmd = i === 0 ? "M" : "L";
    return `${cmd}${fmtPx(point.x)} ${fmtPx(point.y)}`;
  }).join(" ");
}
function bandGapRatio(nCat) {
  return nCat <= 6 ? BAR_GAP_FEW : BAR_GAP_MANY;
}
function barSlot(nCat, nS, catStep, plotLeft, ci, si) {
  const inner = Math.max(catStep * (1 - bandGapRatio(nCat)), 1);
  const seriesGap = nS > 1 ? GROUP_GAP_PX : 0;
  let barW = Math.max(0.5, (inner - seriesGap * (nS - 1)) / nS);
  if (nCat <= BAR_MAX_WIDTH_N) {
    barW = Math.min(barW, BAR_MAX_WIDTH);
  }
  const groupW = barW * nS + seriesGap * (nS - 1);
  const groupStart = plotLeft + ci * catStep + (catStep - groupW) / 2;
  return { x: groupStart + si * (barW + seriesGap), barW };
}
function typicalBarWidth(nCat, nS, catStep) {
  return barSlot(nCat, nS, catStep, 0, 0, 0).barW;
}
function usesEndLabels(chart, seriesCount) {
  if (chart.type !== "line" && chart.type !== "area") {
    return false;
  }
  return seriesCount >= 2 && seriesCount <= END_LABEL_SERIES_MAX;
}
function usesColorLegend(chart, seriesCount) {
  if (seriesCount <= 1) {
    return false;
  }
  if (chart.type === "line" || chart.type === "area") {
    return seriesCount > END_LABEL_SERIES_MAX;
  }
  return true;
}
function endLabelRightMin(series) {
  const widest = Math.max(
    0,
    ...series.map((name) => textWidth(name, TYPE.value.size))
  );
  return END_LABEL_GAP + widest;
}
function prepare(chart) {
  const histMode = chart.type === "hist";
  const rows = histMode ? [] : loadRows(chart);
  const bins = histMode ? binHistogram(histSamplesFromChart(chart)) : [];
  const series = histMode ? [chart.y ?? "count"] : seriesNames(rows);
  const categories = histMode ? bins.map(
    (bin) => `${formatNumber(bin.left)}\u2013${formatNumber(bin.right)}`
  ) : categoryNames(rows);
  const linearX = histMode ? true : usesLinearX(chart, rows);
  const yValues = histMode ? bins.map((bin) => bin.weight) : rows.map((row) => row.y);
  const forceZero = chart.type === "bar" || chart.type === "area" || chart.type === "hist";
  const yDom = yExtent(yValues, forceZero);
  const yTickNums = niceTicks(yDom[0], yDom[1]);
  const yMin = yTickNums[0] ?? yDom[0];
  const yMax = yTickNums[yTickNums.length - 1] ?? yDom[1];
  const compact = compactScale(yTickNums, yMax - yMin);
  const yTickLabels = yTickNums.map((n) => formatTick(n, compact));
  const styles = series.map((_, i) => seriesStyle(i));
  const showLegend = usesColorLegend(chart, series.length);
  const useEndLabels = usesEndLabels(chart, series.length);
  const rightMin = useEndLabels ? endLabelRightMin(series) : 0;
  const xLabelTexts = linearX ? histMode ? Array.from(
    new Set(
      bins.flatMap((bin) => [
        formatNumber(bin.left),
        formatNumber(bin.right)
      ])
    )
  ) : [] : categories;
  const legendDraft = showLegend ? layoutLegend(
    series,
    styles.map((s) => s.color),
    styles.map((s) => s.opacity),
    48,
    TITLE_BASELINE + 18,
    SVG_WIDTH - 96
  ) : { items: [], height: 0 };
  let frame = layoutFrame({
    yTickLabels,
    categoryLabels: xLabelTexts.length ? xLabelTexts : linearX ? [] : categories,
    legendHeight: legendDraft.height,
    rightMin
  });
  const legend = showLegend ? layoutLegend(
    series,
    styles.map((s) => s.color),
    styles.map((s) => s.opacity),
    frame.plot.left,
    TITLE_BASELINE + 18,
    frame.plot.width
  ) : legendDraft;
  if (legend.height !== legendDraft.height && showLegend) {
    frame = layoutFrame({
      yTickLabels,
      categoryLabels: xLabelTexts.length ? xLabelTexts : linearX ? [] : categories,
      legendHeight: legend.height,
      rightMin
    });
  }
  const plot = frame.plot;
  const nCat = Math.max(histMode ? bins.length : categories.length, 1);
  const catStep = plot.width / nCat;
  const nS = Math.max(series.length, 1);
  const barW = typicalBarWidth(nCat, nS, catStep);
  const labelBars = (chart.type === "bar" || chart.type === "hist") && showBarValueLabels(nCat, barW);
  const showInteriorGrid = chart.type === "bar" || chart.type === "hist" ? !labelBars : true;
  const yScale = scaleLinear([yMin, yMax], [plot.bottom, plot.top]);
  const yTicks = yTickNums.map((n) => ({
    pos: yScale(n),
    label: formatTick(n, compact)
  }));
  let xScaleNum = scaleLinear([0, 1], [plot.left, plot.right]);
  let xTicks = [];
  const catCenter = (i) => plot.left + (i + 0.5) * catStep;
  const showAt = (i) => frame.show[i] ?? true;
  if (histMode && bins.length > 0) {
    const lo = bins[0].left;
    const hi = bins[bins.length - 1].right;
    xScaleNum = scaleLinear([lo, hi], [plot.left, plot.right]);
    const edges = bins.map((bin) => bin.left);
    edges.push(bins[bins.length - 1].right);
    xTicks = edges.map((edge, i) => ({
      pos: xScaleNum(edge),
      label: formatNumber(edge),
      show: showAt(i)
    }));
  } else if (linearX) {
    const xs = rows.map((row) => row.xNum).filter((n) => n !== void 0);
    const xDom = xExtent(xs, chart.type === "scatter" ? 0.08 : 0.05);
    const xTickNums = niceTicks(xDom[0], xDom[1]);
    const xMin = xTickNums[0] ?? xDom[0];
    const xMax = xTickNums[xTickNums.length - 1] ?? xDom[1];
    xScaleNum = scaleLinear([xMin, xMax], [plot.left + 8, plot.right - 8]);
    xTicks = xTickNums.map((n) => ({
      pos: xScaleNum(n),
      label: formatNumber(n),
      show: true
    }));
  } else {
    xTicks = categories.map((label, i) => ({
      pos: catCenter(i),
      label,
      show: showAt(i)
    }));
  }
  return {
    rows,
    series,
    categories,
    linearX,
    xTicks,
    yTicks,
    xScaleNum,
    yScale,
    catCenter,
    catStep,
    plot,
    legend,
    rotateX: frame.rotateX,
    bins,
    compact,
    titleUnit: unitWithCompact(chart.unit, compact),
    styles,
    height: frame.height,
    showValueLabels: labelBars,
    showInteriorGrid,
    useEndLabels
  };
}
function drawLegend(prepared) {
  if (prepared.legend.items.length === 0) {
    return [];
  }
  const lines = [
    `  <g ${attrs({
      "font-size": TYPE.legend.size,
      "font-weight": TYPE.legend.weight,
      fill: TYPE.legend.fill
    })}>`
  ];
  for (const item of prepared.legend.items) {
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(item.x),
        y: fmtPx(item.y - 9),
        width: 10,
        height: 10,
        fill: item.color,
        "fill-opacity": item.opacity === 1 ? void 0 : item.opacity,
        rx: 1
      })}/>`
    );
    lines.push(
      `    <text ${attrs({
        x: fmtPx(item.x + 14),
        y: fmtPx(item.y),
        "data-legend": item.name
      })}>${escapeXml(item.name)}</text>`
    );
  }
  lines.push(`  </g>`);
  return lines;
}
function interiorGridTicks(yTicks, plotBottom) {
  const interior = yTicks.filter(
    (tick) => Math.abs(tick.pos - plotBottom) > 0.5
  );
  if (interior.length <= MAX_INTERIOR_GRID) {
    return interior;
  }
  const picked = [];
  const seen = /* @__PURE__ */ new Set();
  for (let i = 0; i < MAX_INTERIOR_GRID; i++) {
    const idx = Math.round(
      i * (interior.length - 1) / (MAX_INTERIOR_GRID - 1)
    );
    const tick = interior[idx];
    if (seen.has(tick.pos)) {
      continue;
    }
    seen.add(tick.pos);
    picked.push(tick);
  }
  return picked;
}
function drawGridAndAxes(prepared) {
  const { plot, xTicks, yTicks, rotateX } = prepared;
  const lines = [];
  if (prepared.showInteriorGrid) {
    const gridTicks = interiorGridTicks(yTicks, plot.bottom);
    if (gridTicks.length > 0) {
      lines.push(
        `  <g ${attrs({
          fill: "none",
          stroke: INK,
          "stroke-opacity": HAIRLINE_OPACITY,
          "stroke-width": 1
        })}>`
      );
      for (const tick of gridTicks) {
        lines.push(
          `    <line ${attrs({
            x1: fmtPx(plot.left),
            x2: fmtPx(plot.right),
            y1: fmtPx(tick.pos),
            y2: fmtPx(tick.pos)
          })}/>`
        );
      }
      lines.push(`  </g>`);
    }
  }
  lines.push(
    `  <path ${attrs({
      d: `M${fmtPx(plot.left)} ${fmtPx(plot.bottom)} L${fmtPx(plot.right)} ${fmtPx(plot.bottom)}`,
      fill: "none",
      stroke: INK,
      "stroke-opacity": STRUCTURE_OPACITY,
      "stroke-width": 1
    })}/>`
  );
  const zeroTick = yTicks.find((tick) => tick.label === "0");
  if (zeroTick && Math.abs(zeroTick.pos - plot.bottom) > 0.5 && Math.abs(zeroTick.pos - plot.top) > 0.5) {
    lines.push(
      `  <line ${attrs({
        x1: fmtPx(plot.left),
        x2: fmtPx(plot.right),
        y1: fmtPx(zeroTick.pos),
        y2: fmtPx(zeroTick.pos),
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1
      })}/>`
    );
  }
  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight
    })}>`
  );
  for (const tick of yTicks) {
    lines.push(
      `    <text ${attrs({
        x: fmtPx(plot.left - TICK_TEXT_GAP),
        y: fmtPx(tick.pos),
        "text-anchor": "end",
        "dominant-baseline": "middle"
      })}>${escapeXml(tick.label)}</text>`
    );
  }
  for (const tick of xTicks) {
    if (!tick.show) {
      continue;
    }
    if (rotateX) {
      const tx = fmtPx(tick.pos);
      const ty = fmtPx(plot.bottom + 8);
      lines.push(
        `    <text ${attrs({
          x: tx,
          y: ty,
          "text-anchor": "end",
          "dominant-baseline": "middle",
          "font-size": TYPE.tick.size,
          transform: `rotate(${LABEL_ROTATE_DEG} ${tx} ${ty})`,
          "data-full-label": tick.label
        })}>${escapeXml(tick.label)}</text>`
      );
    } else {
      lines.push(
        `    <text ${attrs({
          x: fmtPx(tick.pos),
          y: fmtPx(plot.bottom + TYPE.tick.size),
          "text-anchor": "middle",
          "font-size": TYPE.tick.size,
          "data-full-label": tick.label
        })}>${escapeXml(tick.label)}</text>`
      );
    }
  }
  lines.push(`  </g>`);
  return lines;
}
function roundedBarPath(x, y, w, h, roundAwayFromBaselineUp) {
  const r = Math.min(BAR_RX, w / 2, Math.max(h, 0));
  const x0 = fmtPx(x);
  const y0 = fmtPx(y);
  const x1 = fmtPx(x + w);
  const y1 = fmtPx(y + h);
  if (h <= 0.01 || r <= 0) {
    return `M${x0} ${fmtPx(y + h)} L${x1} ${fmtPx(y + h)} L${x1} ${y0} L${x0} ${y0} Z`;
  }
  const rr = fmtPx(r);
  void rr;
  if (roundAwayFromBaselineUp) {
    return `M${x0} ${y1} L${x0} ${fmtPx(y + r)} Q${x0} ${y0} ${fmtPx(x + r)} ${y0} L${fmtPx(x + w - r)} ${y0} Q${x1} ${y0} ${x1} ${fmtPx(y + r)} L${x1} ${y1} Z`;
  }
  return `M${x0} ${y0} L${x1} ${y0} L${x1} ${fmtPx(y + h - r)} Q${x1} ${y1} ${fmtPx(x + w - r)} ${y1} L${fmtPx(x + r)} ${y1} Q${x0} ${y1} ${x0} ${fmtPx(y + h - r)} Z`;
}
function valueLabelY(roundUp, y, h, y0) {
  if (h >= BAR_LABEL_INSIDE_H) {
    return roundUp ? y - BAR_LABEL_OFFSET : y + h + BAR_LABEL_OFFSET + 8;
  }
  if (h < 8) {
    return roundUp ? y0 - BAR_LABEL_OFFSET : y0 + BAR_LABEL_OFFSET + 8;
  }
  return roundUp ? y + 12 : y + h - 6;
}
function drawBars(prepared) {
  const {
    plot,
    series,
    categories,
    rows,
    catStep,
    yScale,
    styles,
    showValueLabels
  } = prepared;
  const nS = Math.max(series.length, 1);
  const nCat = categories.length;
  const y0 = yScale(0);
  const lines = [`  <g>`];
  const labels = [];
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci];
    for (let si = 0; si < series.length; si++) {
      const ser = series[si];
      const val = groupedValue(rows, ser, cat);
      const { x, barW } = barSlot(nCat, nS, catStep, plot.left, ci, si);
      const y1 = yScale(val);
      const y = Math.min(y0, y1);
      const h = Math.abs(y1 - y0);
      const style = styles[si];
      const roundUp = val >= 0;
      lines.push(
        `    <path ${attrs({
          d: roundedBarPath(x, y, barW, h, roundUp),
          fill: style.color,
          "fill-opacity": style.opacity === 1 ? void 0 : style.opacity,
          "data-x": cat,
          "data-series": ser,
          "data-y": String(val)
        })}/>`
      );
      if (!showValueLabels) {
        continue;
      }
      const text = formatNumber(val);
      const cx = x + barW / 2;
      const ly = valueLabelY(roundUp, y, h, y0);
      labels.push(
        `    <text ${attrs({
          x: fmtPx(cx),
          y: fmtPx(ly),
          "text-anchor": "middle",
          "font-size": TYPE.value.size,
          "font-weight": TYPE.value.weight,
          fill: TYPE.value.fill,
          "data-value-label": cat
        })}>${escapeXml(text)}</text>`
      );
    }
  }
  lines.push(`  </g>`);
  if (labels.length > 0) {
    lines.push(`  <g>`);
    lines.push(...labels);
    lines.push(`  </g>`);
  }
  return lines;
}
function xPos(prepared, row, catIndex) {
  if (prepared.linearX && row.xNum !== void 0) {
    return prepared.xScaleNum(row.xNum);
  }
  const i = catIndex.get(row.xLabel) ?? 0;
  return prepared.catCenter(i);
}
function opacityAttr(opacity) {
  return opacity === 1 ? void 0 : opacity;
}
function lastPointBySeries(prepared) {
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const out = [];
  for (let si = 0; si < prepared.series.length; si++) {
    const ser = prepared.series[si];
    let last;
    for (const row of prepared.rows) {
      if (row.series !== ser) {
        continue;
      }
      last = {
        x: xPos(prepared, row, catIndex),
        y: prepared.yScale(row.y)
      };
    }
    if (!last) {
      continue;
    }
    out.push({
      name: ser,
      x: last.x,
      y: last.y,
      color: prepared.styles[si].color
    });
  }
  return out;
}
function dodgeEndLabelYs(items) {
  const order = items.map((item, i) => ({ i, y: item.y })).sort((a, b) => a.y - b.y);
  const ys = items.map((item) => item.y);
  for (let n = 0; n < order.length - 1; n++) {
    const a = order[n];
    const b = order[n + 1];
    const gap = ys[b.i] - ys[a.i];
    if (gap < END_LABEL_MIN_SEP) {
      const nudge = (END_LABEL_MIN_SEP - gap) / 2;
      ys[a.i] -= nudge;
      ys[b.i] += nudge;
    }
  }
  return ys;
}
function drawEndLabels(prepared) {
  if (!prepared.useEndLabels) {
    return [];
  }
  const items = lastPointBySeries(prepared);
  if (items.length === 0) {
    return [];
  }
  const ys = dodgeEndLabelYs(items);
  const lines = [
    `  <g ${attrs({
      "font-size": TYPE.value.size,
      "font-weight": TYPE.value.weight
    })}>`
  ];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    lines.push(
      `    <text ${attrs({
        x: fmtPx(item.x + END_LABEL_GAP),
        y: fmtPx(ys[i]),
        "text-anchor": "start",
        "dominant-baseline": "middle",
        fill: item.color,
        "data-end-label": item.name
      })}>${escapeXml(item.name)}</text>`
    );
  }
  lines.push(`  </g>`);
  return lines;
}
function drawLineOrArea(prepared, area) {
  const { rows, series, yScale, styles } = prepared;
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const zero = yScale(0);
  const lines = [`  <g fill="none">`];
  for (let si = 0; si < series.length; si++) {
    const ser = series[si];
    const pts = [];
    for (const row of rows) {
      if (row.series !== ser) {
        continue;
      }
      pts.push({ x: xPos(prepared, row, catIndex), y: yScale(row.y) });
    }
    if (pts.length === 0) {
      continue;
    }
    const style = styles[si];
    const d = polyline(pts);
    if (area) {
      const first = pts[0];
      const last = pts[pts.length - 1];
      const fillD = `${d} L${fmtPx(last.x)} ${fmtPx(zero)} L${fmtPx(first.x)} ${fmtPx(zero)} Z`;
      lines.push(
        `    <path ${attrs({
          d: fillD,
          fill: style.color,
          "fill-opacity": AREA_OPACITY * style.opacity,
          stroke: "none",
          "data-series": ser
        })}/>`
      );
    }
    lines.push(
      `    <path ${attrs({
        d,
        fill: "none",
        stroke: style.color,
        "stroke-width": LINE_STROKE,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
        "stroke-opacity": opacityAttr(style.opacity),
        "data-series": ser
      })}/>`
    );
    if (pts.length <= POINT_SKIP_AFTER) {
      for (const pt of pts) {
        lines.push(
          `    <circle ${attrs({
            cx: fmtPx(pt.x),
            cy: fmtPx(pt.y),
            r: LINE_POINT_R,
            fill: style.color,
            "fill-opacity": opacityAttr(style.opacity),
            stroke: "none",
            "data-series": ser
          })}/>`
        );
      }
    }
  }
  lines.push(`  </g>`);
  lines.push(...drawEndLabels(prepared));
  return lines;
}
function drawScatter(prepared) {
  const { rows, series, yScale, styles } = prepared;
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const styleOf = new Map(series.map((name, i) => [name, styles[i]]));
  const lines = [`  <g>`];
  for (const row of rows) {
    if (row.xNum === void 0 && prepared.linearX) {
      continue;
    }
    const cx = xPos(prepared, row, catIndex);
    const cy = yScale(row.y);
    const style = styleOf.get(row.series) ?? styles[0];
    lines.push(
      `    <circle ${attrs({
        cx: fmtPx(cx),
        cy: fmtPx(cy),
        r: SCATTER_R,
        fill: style.color,
        "fill-opacity": SCATTER_OPACITY * style.opacity,
        stroke: "none",
        "data-x": row.xLabel,
        "data-y": String(row.y),
        "data-series": row.series
      })}/>`
    );
  }
  lines.push(`  </g>`);
  return lines;
}
function drawHist(prepared) {
  const { bins, xScaleNum, yScale, styles, showValueLabels } = prepared;
  const y0 = yScale(0);
  const style = styles[0];
  const nCat = Math.max(bins.length, 1);
  const lines = [`  <g>`];
  const labels = [];
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i];
    const xLeft = xScaleNum(bin.left);
    const xRight = xScaleNum(bin.right);
    const band = xRight - xLeft;
    const { x, barW } = barSlot(nCat, 1, band, xLeft, 0, 0);
    const y1 = yScale(bin.weight);
    const y = Math.min(y0, y1);
    const h = Math.abs(y1 - y0);
    lines.push(
      `    <path ${attrs({
        d: roundedBarPath(x, y, barW, h, bin.weight >= 0),
        fill: style.color,
        "fill-opacity": opacityAttr(style.opacity),
        "data-bin-left": String(bin.left),
        "data-bin-right": String(bin.right),
        "data-weight": String(bin.weight),
        "data-count": String(bin.count)
      })}/>`
    );
    if (!showValueLabels) {
      continue;
    }
    const roundUp = bin.weight >= 0;
    labels.push(
      `    <text ${attrs({
        x: fmtPx(x + barW / 2),
        y: fmtPx(valueLabelY(roundUp, y, h, y0)),
        "text-anchor": "middle",
        "font-size": TYPE.value.size,
        "font-weight": TYPE.value.weight,
        fill: TYPE.value.fill,
        "data-value-label": `${bin.left}\u2013${bin.right}`
      })}>${escapeXml(formatNumber(bin.weight))}</text>`
    );
  }
  lines.push(`  </g>`);
  if (labels.length > 0) {
    lines.push(`  <g>`);
    lines.push(...labels);
    lines.push(`  </g>`);
  }
  return lines;
}
function renderCartesian(chart, _id) {
  const prepared = prepare(chart);
  const lines = [
    drawTitle(visibleTitle(chart), prepared.plot.left, prepared.titleUnit),
    ...drawLegend(prepared)
  ];
  lines.push(...drawGridAndAxes(prepared));
  if (chart.type === "bar") {
    lines.push(...drawBars(prepared));
  } else if (chart.type === "line") {
    lines.push(...drawLineOrArea(prepared, false));
  } else if (chart.type === "area") {
    lines.push(...drawLineOrArea(prepared, true));
  } else if (chart.type === "scatter") {
    lines.push(...drawScatter(prepared));
  } else if (chart.type === "hist") {
    lines.push(...drawHist(prepared));
  }
  return { lines, height: prepared.height };
}

// ../../packages/render-svg/src/pie.ts
function slicePath(cx, cy, r, a0, a1) {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${fmtPx(cx)} ${fmtPx(cy)} L${fmtPx(x0)} ${fmtPx(y0)} A${fmtPx(r)} ${fmtPx(r)} 0 ${large} 1 ${fmtPx(x1)} ${fmtPx(y1)} Z`;
}
function placeLabels(slices, cx, cy, r) {
  const items = slices.filter((slice) => slice.value > 0).map((slice) => {
    const side = Math.cos(slice.mid) >= 0 ? 1 : -1;
    const text = `${slice.label} \xB7 ${formatNumber(slice.value)}`;
    return {
      slice,
      extraR: 0,
      side,
      text,
      width: textWidth(text, TYPE.value.size),
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
      elbowX: 0,
      lx: 0,
      ly: 0
    };
  });
  const layoutOne = (item) => {
    const mid = item.slice.mid;
    const r1 = r + PIE_LEADER + item.extraR;
    item.x0 = cx + r * Math.cos(mid);
    item.y0 = cy + r * Math.sin(mid);
    item.x1 = cx + r1 * Math.cos(mid);
    item.y1 = cy + r1 * Math.sin(mid);
    item.elbowX = item.x1 + item.side * PIE_ELBOW;
    item.lx = item.elbowX + item.side * PIE_LABEL_GAP;
    item.ly = item.y1;
  };
  for (const item of items) {
    layoutOne(item);
  }
  for (let pass = 0; pass < 16; pass++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        if (a.side !== b.side) {
          continue;
        }
        const dx = a.lx - b.lx;
        const dy = a.ly - b.ly;
        const dist = Math.hypot(dx, dy);
        if (dist < PIE_LABEL_MIN_SEP) {
          const farther = Math.abs(a.slice.mid + Math.PI / 2) >= Math.abs(b.slice.mid + Math.PI / 2) ? a : b;
          farther.extraR += 6;
          layoutOne(farther);
          moved = true;
        }
      }
    }
    if (!moved) {
      break;
    }
  }
  return items;
}
function pieBox(left, right, top, bottom, height) {
  const plotLeft = left;
  const plotRight = SVG_WIDTH - right;
  const plotTop = top;
  const plotBottom = height - bottom;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;
  return {
    left: plotLeft,
    top: plotTop,
    cx: (plotLeft + plotRight) / 2,
    cy: (plotTop + plotBottom) / 2,
    r: Math.min(plotW, plotH) * PIE_RADIUS_RATIO
  };
}
function renderPie(chart, _id) {
  const rows = loadRows(chart);
  const raw = rows.map((row, i) => {
    const style = seriesStyle(i);
    return {
      label: row.xLabel,
      value: Math.max(0, row.y),
      color: style.color,
      opacity: style.opacity
    };
  });
  const sum = raw.reduce((acc, slice) => acc + slice.value, 0);
  let left = MARGIN.left;
  let right = MARGIN.right;
  let top = titleBlockTop(0);
  let bottom = MARGIN.right;
  let height = fitFrameHeight(top, bottom);
  let box = pieBox(left, right, top, bottom, height);
  const slices = [];
  let angle = -Math.PI / 2;
  if (sum > 0) {
    for (const slice of raw) {
      const sweep = slice.value / sum * Math.PI * 2;
      const next = angle + sweep;
      slices.push({
        ...slice,
        a0: angle,
        a1: next,
        mid: angle + sweep / 2
      });
      angle = next;
    }
  }
  let labels = placeLabels(slices, box.cx, box.cy, box.r);
  for (let pass = 0; pass < 3; pass++) {
    let overflowLeft = 0;
    let overflowRight = 0;
    let overflowBottom = 0;
    let overflowTop = 0;
    for (const item of labels) {
      const textLeft = item.side > 0 ? item.lx : item.lx - item.width;
      const textRight = item.side > 0 ? item.lx + item.width : item.lx;
      overflowLeft = Math.max(overflowLeft, 8 - textLeft);
      overflowRight = Math.max(overflowRight, textRight - (SVG_WIDTH - 8));
      overflowBottom = Math.max(
        overflowBottom,
        item.ly + TYPE.value.size / 2 + 4 - (height - 4)
      );
      overflowTop = Math.max(overflowTop, 4 - (item.ly - TYPE.value.size / 2));
    }
    if (overflowLeft <= 0.5 && overflowRight <= 0.5 && overflowBottom <= 0.5 && overflowTop <= 0.5) {
      break;
    }
    left += Math.max(0, overflowLeft);
    right += Math.max(0, overflowRight);
    bottom += Math.max(0, overflowBottom);
    top += Math.max(0, overflowTop);
    height = fitFrameHeight(top, bottom);
    box = pieBox(left, right, top, bottom, height);
    labels = placeLabels(slices, box.cx, box.cy, box.r);
  }
  const { cx, cy, r } = box;
  const lines = [drawTitle(visibleTitle(chart), box.left, chart.unit)];
  lines.push(`  <g ${attrs({ "aria-hidden": "true" })}>`);
  if (sum <= 0) {
    lines.push(
      `    <circle ${attrs({
        cx: fmtPx(cx),
        cy: fmtPx(cy),
        r: fmtPx(r),
        fill: "none",
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1.5,
        "data-empty": "true"
      })}/>`
    );
  } else {
    for (const slice of slices) {
      if (slice.value <= 0) {
        continue;
      }
      if (slice.value === sum) {
        lines.push(
          `    <circle ${attrs({
            cx: fmtPx(cx),
            cy: fmtPx(cy),
            r: fmtPx(r),
            fill: slice.color,
            "fill-opacity": slice.opacity === 1 ? void 0 : slice.opacity,
            stroke: INK,
            "stroke-opacity": STRUCTURE_OPACITY,
            "stroke-width": PIE_STROKE,
            "data-label": slice.label,
            "data-raw-value": String(slice.value)
          })}/>`
        );
        continue;
      }
      lines.push(
        `    <path ${attrs({
          d: slicePath(cx, cy, r, slice.a0, slice.a1),
          fill: slice.color,
          "fill-opacity": slice.opacity === 1 ? void 0 : slice.opacity,
          stroke: INK,
          "stroke-opacity": STRUCTURE_OPACITY,
          "stroke-width": PIE_STROKE,
          "data-label": slice.label,
          "data-raw-value": String(slice.value)
        })}/>`
      );
    }
  }
  lines.push(`  </g>`);
  if (labels.length > 0) {
    lines.push(
      `  <g ${attrs({
        fill: "none",
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1
      })}>`
    );
    for (const item of labels) {
      lines.push(
        `    <polyline ${attrs({
          points: `${fmtPx(item.x0)},${fmtPx(item.y0)} ${fmtPx(item.x1)},${fmtPx(item.y1)} ${fmtPx(item.elbowX)},${fmtPx(item.y1)}`
        })}/>`
      );
    }
    lines.push(`  </g>`);
    lines.push(
      `  <g ${attrs({
        "font-size": TYPE.value.size,
        "font-weight": TYPE.value.weight,
        fill: TYPE.value.fill
      })}>`
    );
    for (const item of labels) {
      lines.push(
        `    <text ${attrs({
          x: fmtPx(item.lx),
          y: fmtPx(item.ly),
          "text-anchor": item.side > 0 ? "start" : "end",
          "dominant-baseline": "middle",
          "data-label": item.slice.label
        })}>${escapeXml(item.text)}</text>`
      );
    }
    lines.push(`  </g>`);
  }
  return { lines, height };
}

// ../../packages/render-svg/src/render.ts
function ariaLabel(chart) {
  const n = chart.table.rows.length;
  const unit = chart.unit ? ` (${chart.unit})` : "";
  if (chart.type === "pie") {
    return `${chart.type} chart: ${chart.title}${unit}, ${n} slices`;
  }
  if (chart.series) {
    return `${chart.type} chart: ${chart.title}${unit}, ${n} rows, series ${chart.series}`;
  }
  return `${chart.type} chart: ${chart.title}${unit}, ${n} rows`;
}
function description(chart) {
  const bits = [
    `${chart.type} chart`,
    chart.title,
    `x=${chart.x}`
  ];
  if (chart.y) {
    bits.push(`y=${chart.y}`);
  }
  if (chart.series) {
    bits.push(`series=${chart.series}`);
  }
  if (chart.unit) {
    bits.push(`unit=${chart.unit}`);
  }
  bits.push(`${chart.table.rows.length} rows`);
  if (chart.type === "pie") {
    bits.push("slice sizes are raw values and are not normalized to 100");
  }
  if (chart.type === "hist") {
    bits.push("x is binned with Sturges equal-width bins");
    if (chart.y) {
      bits.push("y is sample weight");
    }
  }
  return `${bits.join(". ")}.`;
}
function renderSvg(chart) {
  const id = chartId(chart);
  const painted = chart.type === "pie" ? renderPie(chart, id) : renderCartesian(chart, id);
  const open = `<svg ${attrs({
    xmlns: "http://www.w3.org/2000/svg",
    width: SVG_WIDTH,
    height: painted.height,
    viewBox: `0 0 ${SVG_WIDTH} ${painted.height}`,
    role: "img",
    "aria-label": ariaLabel(chart),
    "aria-labelledby": `${id}-title`,
    "aria-describedby": `${id}-desc`,
    "data-markvis": 2,
    "data-chart-type": chart.type,
    "data-id": id,
    "font-family": FONT,
    "font-size": 12
  })}>`;
  const lines = [
    open,
    `  <title id="${id}-title">${escapeXml(chart.title)}</title>`,
    `  <desc id="${id}-desc">${escapeXml(description(chart))}</desc>`,
    ...painted.lines,
    `</svg>`
  ];
  return `${lines.join("\n")}
`;
}

// ../../packages/markdown-it/src/html.ts
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function htmlTable(table) {
  if (table.columns.length === 0) {
    return "";
  }
  const head = table.columns.map((col) => `<th>${escapeHtml(col)}</th>`).join("");
  const body = table.rows.map((row) => {
    const cells = table.columns.map((_, i) => `<td>${escapeHtml(row[i] ?? "")}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}
function fallbackTable(result) {
  if (result.table.columns.length > 0) {
    return result.table;
  }
  const raw = result.raw.trim();
  if (!raw) {
    return { columns: [], rows: [] };
  }
  return { columns: ["_raw"], rows: [[raw]] };
}
function resultToHtml(result) {
  if (result.ok) {
    const svg = renderSvg(result.chart).trimEnd();
    const caption = escapeHtml(result.chart.title);
    const type = escapeHtml(result.chart.type);
    const table2 = htmlTable(result.chart.table);
    return `<figure class="markvis" data-markvis="2" data-chart-type="${type}">
${svg}
<figcaption>${caption}</figcaption>
${table2}
</figure>`;
  }
  const table = htmlTable(fallbackTable(result));
  const error = escapeHtml(result.error.message);
  const parts = [];
  if (table) {
    parts.push(table);
  }
  parts.push(`<p class="markvis-error">${error}</p>`);
  return parts.join("\n");
}
function chartBlockHtml(raw, filename) {
  const result = filename === void 0 ? parseMarkdown(raw) : parseMarkdown(raw, { filename });
  return resultToHtml(result);
}

// ../../packages/markdown-it/src/plugin.ts
var LANGS = /* @__PURE__ */ new Set(["chart", "markvis", "vis"]);
function lineAt(src, offset) {
  let line = 0;
  const end = Math.min(Math.max(offset, 0), src.length);
  for (let i = 0; i < end; i++) {
    if (src.charCodeAt(i) === 10) {
      line += 1;
    }
  }
  return line;
}
function fenceLang(info) {
  return info.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
}
function replaceCharts(state) {
  const src = state.src;
  const charts = extractCharts(src);
  if (charts.length === 0) {
    return;
  }
  for (let c = charts.length - 1; c >= 0; c--) {
    const chart = charts[c];
    const start = chart.index;
    const end = chart.index + chart.raw.length;
    const startLine = lineAt(src, start);
    const lastLine = lineAt(src, Math.max(start, end - 1));
    const tokens = state.tokens;
    let from = -1;
    let to = -1;
    for (let i = 0; i < tokens.length; i++) {
      const map = tokens[i].map;
      if (!map) {
        continue;
      }
      const line = map[0];
      if (line >= startLine && line <= lastLine) {
        if (from === -1) {
          from = i;
        }
        to = i;
      }
    }
    if (from === -1 || to === -1) {
      continue;
    }
    const token = new state.Token("html_block", "", 0);
    token.content = `${chartBlockHtml(chart.raw)}
`;
    token.map = [startLine, lastLine + 1];
    token.block = true;
    tokens.splice(from, to - from + 1, token);
  }
}
function markdownItMarkvis(md) {
  md.core.ruler.after("block", "markvis_charts", replaceCharts);
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    const lang = fenceLang(token.info);
    if (LANGS.has(lang)) {
      const body = token.content;
      const raw = `\`\`\`${lang}
${body}\`\`\``;
      return `${chartBlockHtml(raw)}
`;
    }
    if (defaultFence) {
      return defaultFence(tokens, idx, options, env, slf);
    }
    return slf.renderToken(tokens, idx, options);
  };
}

// src/extension.ts
function activate() {
  return {
    extendMarkdownIt(md) {
      markdownItMarkvis(md);
      return md;
    }
  };
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
