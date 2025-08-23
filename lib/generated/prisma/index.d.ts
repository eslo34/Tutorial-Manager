
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Client
 * 
 */
export type Client = $Result.DefaultSelection<Prisma.$ClientPayload>
/**
 * Model Project
 * 
 */
export type Project = $Result.DefaultSelection<Prisma.$ProjectPayload>
/**
 * Model LearningSession
 * 
 */
export type LearningSession = $Result.DefaultSelection<Prisma.$LearningSessionPayload>
/**
 * Model LearningTask
 * 
 */
export type LearningTask = $Result.DefaultSelection<Prisma.$LearningTaskPayload>
/**
 * Model LearningProgress
 * 
 */
export type LearningProgress = $Result.DefaultSelection<Prisma.$LearningProgressPayload>
/**
 * Model LearningChatMessage
 * 
 */
export type LearningChatMessage = $Result.DefaultSelection<Prisma.$LearningChatMessagePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.client`: Exposes CRUD operations for the **Client** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Clients
    * const clients = await prisma.client.findMany()
    * ```
    */
  get client(): Prisma.ClientDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.project`: Exposes CRUD operations for the **Project** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Projects
    * const projects = await prisma.project.findMany()
    * ```
    */
  get project(): Prisma.ProjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.learningSession`: Exposes CRUD operations for the **LearningSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LearningSessions
    * const learningSessions = await prisma.learningSession.findMany()
    * ```
    */
  get learningSession(): Prisma.LearningSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.learningTask`: Exposes CRUD operations for the **LearningTask** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LearningTasks
    * const learningTasks = await prisma.learningTask.findMany()
    * ```
    */
  get learningTask(): Prisma.LearningTaskDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.learningProgress`: Exposes CRUD operations for the **LearningProgress** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LearningProgresses
    * const learningProgresses = await prisma.learningProgress.findMany()
    * ```
    */
  get learningProgress(): Prisma.LearningProgressDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.learningChatMessage`: Exposes CRUD operations for the **LearningChatMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LearningChatMessages
    * const learningChatMessages = await prisma.learningChatMessage.findMany()
    * ```
    */
  get learningChatMessage(): Prisma.LearningChatMessageDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.10.1
   * Query Engine version: 9b628578b3b7cae625e8c927178f15a170e74a9c
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Client: 'Client',
    Project: 'Project',
    LearningSession: 'LearningSession',
    LearningTask: 'LearningTask',
    LearningProgress: 'LearningProgress',
    LearningChatMessage: 'LearningChatMessage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "client" | "project" | "learningSession" | "learningTask" | "learningProgress" | "learningChatMessage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Client: {
        payload: Prisma.$ClientPayload<ExtArgs>
        fields: Prisma.ClientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          findFirst: {
            args: Prisma.ClientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          findMany: {
            args: Prisma.ClientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          create: {
            args: Prisma.ClientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          createMany: {
            args: Prisma.ClientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          delete: {
            args: Prisma.ClientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          update: {
            args: Prisma.ClientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          deleteMany: {
            args: Prisma.ClientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClientUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          upsert: {
            args: Prisma.ClientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          aggregate: {
            args: Prisma.ClientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClient>
          }
          groupBy: {
            args: Prisma.ClientGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClientGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClientCountArgs<ExtArgs>
            result: $Utils.Optional<ClientCountAggregateOutputType> | number
          }
        }
      }
      Project: {
        payload: Prisma.$ProjectPayload<ExtArgs>
        fields: Prisma.ProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findFirst: {
            args: Prisma.ProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findMany: {
            args: Prisma.ProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          create: {
            args: Prisma.ProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          createMany: {
            args: Prisma.ProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          delete: {
            args: Prisma.ProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          update: {
            args: Prisma.ProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          deleteMany: {
            args: Prisma.ProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          upsert: {
            args: Prisma.ProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          aggregate: {
            args: Prisma.ProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProject>
          }
          groupBy: {
            args: Prisma.ProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProjectCountArgs<ExtArgs>
            result: $Utils.Optional<ProjectCountAggregateOutputType> | number
          }
        }
      }
      LearningSession: {
        payload: Prisma.$LearningSessionPayload<ExtArgs>
        fields: Prisma.LearningSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LearningSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LearningSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>
          }
          findFirst: {
            args: Prisma.LearningSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LearningSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>
          }
          findMany: {
            args: Prisma.LearningSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>[]
          }
          create: {
            args: Prisma.LearningSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>
          }
          createMany: {
            args: Prisma.LearningSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LearningSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>[]
          }
          delete: {
            args: Prisma.LearningSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>
          }
          update: {
            args: Prisma.LearningSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>
          }
          deleteMany: {
            args: Prisma.LearningSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LearningSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LearningSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>[]
          }
          upsert: {
            args: Prisma.LearningSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningSessionPayload>
          }
          aggregate: {
            args: Prisma.LearningSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLearningSession>
          }
          groupBy: {
            args: Prisma.LearningSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<LearningSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.LearningSessionCountArgs<ExtArgs>
            result: $Utils.Optional<LearningSessionCountAggregateOutputType> | number
          }
        }
      }
      LearningTask: {
        payload: Prisma.$LearningTaskPayload<ExtArgs>
        fields: Prisma.LearningTaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LearningTaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LearningTaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>
          }
          findFirst: {
            args: Prisma.LearningTaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LearningTaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>
          }
          findMany: {
            args: Prisma.LearningTaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>[]
          }
          create: {
            args: Prisma.LearningTaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>
          }
          createMany: {
            args: Prisma.LearningTaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LearningTaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>[]
          }
          delete: {
            args: Prisma.LearningTaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>
          }
          update: {
            args: Prisma.LearningTaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>
          }
          deleteMany: {
            args: Prisma.LearningTaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LearningTaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LearningTaskUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>[]
          }
          upsert: {
            args: Prisma.LearningTaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningTaskPayload>
          }
          aggregate: {
            args: Prisma.LearningTaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLearningTask>
          }
          groupBy: {
            args: Prisma.LearningTaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<LearningTaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.LearningTaskCountArgs<ExtArgs>
            result: $Utils.Optional<LearningTaskCountAggregateOutputType> | number
          }
        }
      }
      LearningProgress: {
        payload: Prisma.$LearningProgressPayload<ExtArgs>
        fields: Prisma.LearningProgressFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LearningProgressFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LearningProgressFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>
          }
          findFirst: {
            args: Prisma.LearningProgressFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LearningProgressFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>
          }
          findMany: {
            args: Prisma.LearningProgressFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>[]
          }
          create: {
            args: Prisma.LearningProgressCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>
          }
          createMany: {
            args: Prisma.LearningProgressCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LearningProgressCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>[]
          }
          delete: {
            args: Prisma.LearningProgressDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>
          }
          update: {
            args: Prisma.LearningProgressUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>
          }
          deleteMany: {
            args: Prisma.LearningProgressDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LearningProgressUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LearningProgressUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>[]
          }
          upsert: {
            args: Prisma.LearningProgressUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningProgressPayload>
          }
          aggregate: {
            args: Prisma.LearningProgressAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLearningProgress>
          }
          groupBy: {
            args: Prisma.LearningProgressGroupByArgs<ExtArgs>
            result: $Utils.Optional<LearningProgressGroupByOutputType>[]
          }
          count: {
            args: Prisma.LearningProgressCountArgs<ExtArgs>
            result: $Utils.Optional<LearningProgressCountAggregateOutputType> | number
          }
        }
      }
      LearningChatMessage: {
        payload: Prisma.$LearningChatMessagePayload<ExtArgs>
        fields: Prisma.LearningChatMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LearningChatMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LearningChatMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>
          }
          findFirst: {
            args: Prisma.LearningChatMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LearningChatMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>
          }
          findMany: {
            args: Prisma.LearningChatMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>[]
          }
          create: {
            args: Prisma.LearningChatMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>
          }
          createMany: {
            args: Prisma.LearningChatMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LearningChatMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>[]
          }
          delete: {
            args: Prisma.LearningChatMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>
          }
          update: {
            args: Prisma.LearningChatMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>
          }
          deleteMany: {
            args: Prisma.LearningChatMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LearningChatMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LearningChatMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>[]
          }
          upsert: {
            args: Prisma.LearningChatMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LearningChatMessagePayload>
          }
          aggregate: {
            args: Prisma.LearningChatMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLearningChatMessage>
          }
          groupBy: {
            args: Prisma.LearningChatMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<LearningChatMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.LearningChatMessageCountArgs<ExtArgs>
            result: $Utils.Optional<LearningChatMessageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    client?: ClientOmit
    project?: ProjectOmit
    learningSession?: LearningSessionOmit
    learningTask?: LearningTaskOmit
    learningProgress?: LearningProgressOmit
    learningChatMessage?: LearningChatMessageOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    clients: number
    projects: number
    learning_sessions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clients?: boolean | UserCountOutputTypeCountClientsArgs
    projects?: boolean | UserCountOutputTypeCountProjectsArgs
    learning_sessions?: boolean | UserCountOutputTypeCountLearning_sessionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountClientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountProjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLearning_sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningSessionWhereInput
  }


  /**
   * Count Type ClientCountOutputType
   */

  export type ClientCountOutputType = {
    projects: number
    learning_sessions: number
  }

  export type ClientCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    projects?: boolean | ClientCountOutputTypeCountProjectsArgs
    learning_sessions?: boolean | ClientCountOutputTypeCountLearning_sessionsArgs
  }

  // Custom InputTypes
  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientCountOutputType
     */
    select?: ClientCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountProjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountLearning_sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningSessionWhereInput
  }


  /**
   * Count Type LearningSessionCountOutputType
   */

  export type LearningSessionCountOutputType = {
    tasks: number
    progress: number
    chat_messages: number
  }

  export type LearningSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | LearningSessionCountOutputTypeCountTasksArgs
    progress?: boolean | LearningSessionCountOutputTypeCountProgressArgs
    chat_messages?: boolean | LearningSessionCountOutputTypeCountChat_messagesArgs
  }

  // Custom InputTypes
  /**
   * LearningSessionCountOutputType without action
   */
  export type LearningSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSessionCountOutputType
     */
    select?: LearningSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LearningSessionCountOutputType without action
   */
  export type LearningSessionCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningTaskWhereInput
  }

  /**
   * LearningSessionCountOutputType without action
   */
  export type LearningSessionCountOutputTypeCountProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningProgressWhereInput
  }

  /**
   * LearningSessionCountOutputType without action
   */
  export type LearningSessionCountOutputTypeCountChat_messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningChatMessageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    name: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    name: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    name: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    created_at?: true
    updated_at?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    password: string
    name: string | null
    created_at: Date
    updated_at: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    created_at?: boolean
    updated_at?: boolean
    clients?: boolean | User$clientsArgs<ExtArgs>
    projects?: boolean | User$projectsArgs<ExtArgs>
    learning_sessions?: boolean | User$learning_sessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "name" | "created_at" | "updated_at", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clients?: boolean | User$clientsArgs<ExtArgs>
    projects?: boolean | User$projectsArgs<ExtArgs>
    learning_sessions?: boolean | User$learning_sessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      clients: Prisma.$ClientPayload<ExtArgs>[]
      projects: Prisma.$ProjectPayload<ExtArgs>[]
      learning_sessions: Prisma.$LearningSessionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      name: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    clients<T extends User$clientsArgs<ExtArgs> = {}>(args?: Subset<T, User$clientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    projects<T extends User$projectsArgs<ExtArgs> = {}>(args?: Subset<T, User$projectsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    learning_sessions<T extends User$learning_sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$learning_sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly created_at: FieldRef<"User", 'DateTime'>
    readonly updated_at: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.clients
   */
  export type User$clientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    where?: ClientWhereInput
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    cursor?: ClientWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * User.projects
   */
  export type User$projectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    cursor?: ProjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * User.learning_sessions
   */
  export type User$learning_sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    where?: LearningSessionWhereInput
    orderBy?: LearningSessionOrderByWithRelationInput | LearningSessionOrderByWithRelationInput[]
    cursor?: LearningSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LearningSessionScalarFieldEnum | LearningSessionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Client
   */

  export type AggregateClient = {
    _count: ClientCountAggregateOutputType | null
    _avg: ClientAvgAggregateOutputType | null
    _sum: ClientSumAggregateOutputType | null
    _min: ClientMinAggregateOutputType | null
    _max: ClientMaxAggregateOutputType | null
  }

  export type ClientAvgAggregateOutputType = {
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
  }

  export type ClientSumAggregateOutputType = {
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
  }

  export type ClientMinAggregateOutputType = {
    id: string | null
    name: string | null
    company: string | null
    email: string | null
    user_id: string | null
    created_at: Date | null
    updated_at: Date | null
    scraped_content: string | null
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
    scraped_at: Date | null
    scraped_url: string | null
  }

  export type ClientMaxAggregateOutputType = {
    id: string | null
    name: string | null
    company: string | null
    email: string | null
    user_id: string | null
    created_at: Date | null
    updated_at: Date | null
    scraped_content: string | null
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
    scraped_at: Date | null
    scraped_url: string | null
  }

  export type ClientCountAggregateOutputType = {
    id: number
    name: number
    company: number
    email: number
    user_id: number
    created_at: number
    updated_at: number
    scraped_content: number
    scraped_pages: number
    scraped_chars: number
    scraped_words: number
    scraped_at: number
    scraped_url: number
    _all: number
  }


  export type ClientAvgAggregateInputType = {
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
  }

  export type ClientSumAggregateInputType = {
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
  }

  export type ClientMinAggregateInputType = {
    id?: true
    name?: true
    company?: true
    email?: true
    user_id?: true
    created_at?: true
    updated_at?: true
    scraped_content?: true
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
    scraped_at?: true
    scraped_url?: true
  }

  export type ClientMaxAggregateInputType = {
    id?: true
    name?: true
    company?: true
    email?: true
    user_id?: true
    created_at?: true
    updated_at?: true
    scraped_content?: true
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
    scraped_at?: true
    scraped_url?: true
  }

  export type ClientCountAggregateInputType = {
    id?: true
    name?: true
    company?: true
    email?: true
    user_id?: true
    created_at?: true
    updated_at?: true
    scraped_content?: true
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
    scraped_at?: true
    scraped_url?: true
    _all?: true
  }

  export type ClientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Client to aggregate.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Clients
    **/
    _count?: true | ClientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ClientAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ClientSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClientMaxAggregateInputType
  }

  export type GetClientAggregateType<T extends ClientAggregateArgs> = {
        [P in keyof T & keyof AggregateClient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClient[P]>
      : GetScalarType<T[P], AggregateClient[P]>
  }




  export type ClientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientWhereInput
    orderBy?: ClientOrderByWithAggregationInput | ClientOrderByWithAggregationInput[]
    by: ClientScalarFieldEnum[] | ClientScalarFieldEnum
    having?: ClientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClientCountAggregateInputType | true
    _avg?: ClientAvgAggregateInputType
    _sum?: ClientSumAggregateInputType
    _min?: ClientMinAggregateInputType
    _max?: ClientMaxAggregateInputType
  }

  export type ClientGroupByOutputType = {
    id: string
    name: string
    company: string
    email: string | null
    user_id: string
    created_at: Date
    updated_at: Date
    scraped_content: string | null
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
    scraped_at: Date | null
    scraped_url: string | null
    _count: ClientCountAggregateOutputType | null
    _avg: ClientAvgAggregateOutputType | null
    _sum: ClientSumAggregateOutputType | null
    _min: ClientMinAggregateOutputType | null
    _max: ClientMaxAggregateOutputType | null
  }

  type GetClientGroupByPayload<T extends ClientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClientGroupByOutputType[P]>
            : GetScalarType<T[P], ClientGroupByOutputType[P]>
        }
      >
    >


  export type ClientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    company?: boolean
    email?: boolean
    user_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    scraped_content?: boolean
    scraped_pages?: boolean
    scraped_chars?: boolean
    scraped_words?: boolean
    scraped_at?: boolean
    scraped_url?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    projects?: boolean | Client$projectsArgs<ExtArgs>
    learning_sessions?: boolean | Client$learning_sessionsArgs<ExtArgs>
    _count?: boolean | ClientCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["client"]>

  export type ClientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    company?: boolean
    email?: boolean
    user_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    scraped_content?: boolean
    scraped_pages?: boolean
    scraped_chars?: boolean
    scraped_words?: boolean
    scraped_at?: boolean
    scraped_url?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["client"]>

  export type ClientSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    company?: boolean
    email?: boolean
    user_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    scraped_content?: boolean
    scraped_pages?: boolean
    scraped_chars?: boolean
    scraped_words?: boolean
    scraped_at?: boolean
    scraped_url?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["client"]>

  export type ClientSelectScalar = {
    id?: boolean
    name?: boolean
    company?: boolean
    email?: boolean
    user_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    scraped_content?: boolean
    scraped_pages?: boolean
    scraped_chars?: boolean
    scraped_words?: boolean
    scraped_at?: boolean
    scraped_url?: boolean
  }

  export type ClientOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "company" | "email" | "user_id" | "created_at" | "updated_at" | "scraped_content" | "scraped_pages" | "scraped_chars" | "scraped_words" | "scraped_at" | "scraped_url", ExtArgs["result"]["client"]>
  export type ClientInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    projects?: boolean | Client$projectsArgs<ExtArgs>
    learning_sessions?: boolean | Client$learning_sessionsArgs<ExtArgs>
    _count?: boolean | ClientCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClientIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ClientIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ClientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Client"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      projects: Prisma.$ProjectPayload<ExtArgs>[]
      learning_sessions: Prisma.$LearningSessionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      company: string
      email: string | null
      user_id: string
      created_at: Date
      updated_at: Date
      scraped_content: string | null
      scraped_pages: number | null
      scraped_chars: number | null
      scraped_words: number | null
      scraped_at: Date | null
      scraped_url: string | null
    }, ExtArgs["result"]["client"]>
    composites: {}
  }

  type ClientGetPayload<S extends boolean | null | undefined | ClientDefaultArgs> = $Result.GetResult<Prisma.$ClientPayload, S>

  type ClientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClientFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClientCountAggregateInputType | true
    }

  export interface ClientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Client'], meta: { name: 'Client' } }
    /**
     * Find zero or one Client that matches the filter.
     * @param {ClientFindUniqueArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClientFindUniqueArgs>(args: SelectSubset<T, ClientFindUniqueArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Client that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClientFindUniqueOrThrowArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClientFindUniqueOrThrowArgs>(args: SelectSubset<T, ClientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Client that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindFirstArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClientFindFirstArgs>(args?: SelectSubset<T, ClientFindFirstArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Client that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindFirstOrThrowArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClientFindFirstOrThrowArgs>(args?: SelectSubset<T, ClientFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Clients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clients
     * const clients = await prisma.client.findMany()
     * 
     * // Get first 10 Clients
     * const clients = await prisma.client.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clientWithIdOnly = await prisma.client.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClientFindManyArgs>(args?: SelectSubset<T, ClientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Client.
     * @param {ClientCreateArgs} args - Arguments to create a Client.
     * @example
     * // Create one Client
     * const Client = await prisma.client.create({
     *   data: {
     *     // ... data to create a Client
     *   }
     * })
     * 
     */
    create<T extends ClientCreateArgs>(args: SelectSubset<T, ClientCreateArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Clients.
     * @param {ClientCreateManyArgs} args - Arguments to create many Clients.
     * @example
     * // Create many Clients
     * const client = await prisma.client.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClientCreateManyArgs>(args?: SelectSubset<T, ClientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Clients and returns the data saved in the database.
     * @param {ClientCreateManyAndReturnArgs} args - Arguments to create many Clients.
     * @example
     * // Create many Clients
     * const client = await prisma.client.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Clients and only return the `id`
     * const clientWithIdOnly = await prisma.client.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClientCreateManyAndReturnArgs>(args?: SelectSubset<T, ClientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Client.
     * @param {ClientDeleteArgs} args - Arguments to delete one Client.
     * @example
     * // Delete one Client
     * const Client = await prisma.client.delete({
     *   where: {
     *     // ... filter to delete one Client
     *   }
     * })
     * 
     */
    delete<T extends ClientDeleteArgs>(args: SelectSubset<T, ClientDeleteArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Client.
     * @param {ClientUpdateArgs} args - Arguments to update one Client.
     * @example
     * // Update one Client
     * const client = await prisma.client.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClientUpdateArgs>(args: SelectSubset<T, ClientUpdateArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Clients.
     * @param {ClientDeleteManyArgs} args - Arguments to filter Clients to delete.
     * @example
     * // Delete a few Clients
     * const { count } = await prisma.client.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClientDeleteManyArgs>(args?: SelectSubset<T, ClientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clients
     * const client = await prisma.client.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClientUpdateManyArgs>(args: SelectSubset<T, ClientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clients and returns the data updated in the database.
     * @param {ClientUpdateManyAndReturnArgs} args - Arguments to update many Clients.
     * @example
     * // Update many Clients
     * const client = await prisma.client.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Clients and only return the `id`
     * const clientWithIdOnly = await prisma.client.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClientUpdateManyAndReturnArgs>(args: SelectSubset<T, ClientUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Client.
     * @param {ClientUpsertArgs} args - Arguments to update or create a Client.
     * @example
     * // Update or create a Client
     * const client = await prisma.client.upsert({
     *   create: {
     *     // ... data to create a Client
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Client we want to update
     *   }
     * })
     */
    upsert<T extends ClientUpsertArgs>(args: SelectSubset<T, ClientUpsertArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Clients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientCountArgs} args - Arguments to filter Clients to count.
     * @example
     * // Count the number of Clients
     * const count = await prisma.client.count({
     *   where: {
     *     // ... the filter for the Clients we want to count
     *   }
     * })
    **/
    count<T extends ClientCountArgs>(
      args?: Subset<T, ClientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Client.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClientAggregateArgs>(args: Subset<T, ClientAggregateArgs>): Prisma.PrismaPromise<GetClientAggregateType<T>>

    /**
     * Group by Client.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClientGroupByArgs['orderBy'] }
        : { orderBy?: ClientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Client model
   */
  readonly fields: ClientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Client.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    projects<T extends Client$projectsArgs<ExtArgs> = {}>(args?: Subset<T, Client$projectsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    learning_sessions<T extends Client$learning_sessionsArgs<ExtArgs> = {}>(args?: Subset<T, Client$learning_sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Client model
   */
  interface ClientFieldRefs {
    readonly id: FieldRef<"Client", 'String'>
    readonly name: FieldRef<"Client", 'String'>
    readonly company: FieldRef<"Client", 'String'>
    readonly email: FieldRef<"Client", 'String'>
    readonly user_id: FieldRef<"Client", 'String'>
    readonly created_at: FieldRef<"Client", 'DateTime'>
    readonly updated_at: FieldRef<"Client", 'DateTime'>
    readonly scraped_content: FieldRef<"Client", 'String'>
    readonly scraped_pages: FieldRef<"Client", 'Int'>
    readonly scraped_chars: FieldRef<"Client", 'Int'>
    readonly scraped_words: FieldRef<"Client", 'Int'>
    readonly scraped_at: FieldRef<"Client", 'DateTime'>
    readonly scraped_url: FieldRef<"Client", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Client findUnique
   */
  export type ClientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client findUniqueOrThrow
   */
  export type ClientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client findFirst
   */
  export type ClientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clients.
     */
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client findFirstOrThrow
   */
  export type ClientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clients.
     */
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client findMany
   */
  export type ClientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Clients to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client create
   */
  export type ClientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The data needed to create a Client.
     */
    data: XOR<ClientCreateInput, ClientUncheckedCreateInput>
  }

  /**
   * Client createMany
   */
  export type ClientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Clients.
     */
    data: ClientCreateManyInput | ClientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Client createManyAndReturn
   */
  export type ClientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * The data used to create many Clients.
     */
    data: ClientCreateManyInput | ClientCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Client update
   */
  export type ClientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The data needed to update a Client.
     */
    data: XOR<ClientUpdateInput, ClientUncheckedUpdateInput>
    /**
     * Choose, which Client to update.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client updateMany
   */
  export type ClientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Clients.
     */
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyInput>
    /**
     * Filter which Clients to update
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to update.
     */
    limit?: number
  }

  /**
   * Client updateManyAndReturn
   */
  export type ClientUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * The data used to update Clients.
     */
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyInput>
    /**
     * Filter which Clients to update
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Client upsert
   */
  export type ClientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The filter to search for the Client to update in case it exists.
     */
    where: ClientWhereUniqueInput
    /**
     * In case the Client found by the `where` argument doesn't exist, create a new Client with this data.
     */
    create: XOR<ClientCreateInput, ClientUncheckedCreateInput>
    /**
     * In case the Client was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClientUpdateInput, ClientUncheckedUpdateInput>
  }

  /**
   * Client delete
   */
  export type ClientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter which Client to delete.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client deleteMany
   */
  export type ClientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clients to delete
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to delete.
     */
    limit?: number
  }

  /**
   * Client.projects
   */
  export type Client$projectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    cursor?: ProjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Client.learning_sessions
   */
  export type Client$learning_sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    where?: LearningSessionWhereInput
    orderBy?: LearningSessionOrderByWithRelationInput | LearningSessionOrderByWithRelationInput[]
    cursor?: LearningSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LearningSessionScalarFieldEnum | LearningSessionScalarFieldEnum[]
  }

  /**
   * Client without action
   */
  export type ClientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
  }


  /**
   * Model Project
   */

  export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null
    _avg: ProjectAvgAggregateOutputType | null
    _sum: ProjectSumAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  export type ProjectAvgAggregateOutputType = {
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
  }

  export type ProjectSumAggregateOutputType = {
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
  }

  export type ProjectMinAggregateOutputType = {
    id: string | null
    client_id: string | null
    title: string | null
    description: string | null
    prompt: string | null
    status: string | null
    script: string | null
    user_id: string | null
    created_at: Date | null
    updated_at: Date | null
    scraped_content: string | null
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
    scraped_at: Date | null
    scraped_url: string | null
    video_type: string | null
  }

  export type ProjectMaxAggregateOutputType = {
    id: string | null
    client_id: string | null
    title: string | null
    description: string | null
    prompt: string | null
    status: string | null
    script: string | null
    user_id: string | null
    created_at: Date | null
    updated_at: Date | null
    scraped_content: string | null
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
    scraped_at: Date | null
    scraped_url: string | null
    video_type: string | null
  }

  export type ProjectCountAggregateOutputType = {
    id: number
    client_id: number
    title: number
    description: number
    documentation_urls: number
    prompt: number
    status: number
    script: number
    user_id: number
    created_at: number
    updated_at: number
    scraped_content: number
    scraped_pages: number
    scraped_chars: number
    scraped_words: number
    scraped_at: number
    scraped_url: number
    video_type: number
    _all: number
  }


  export type ProjectAvgAggregateInputType = {
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
  }

  export type ProjectSumAggregateInputType = {
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
  }

  export type ProjectMinAggregateInputType = {
    id?: true
    client_id?: true
    title?: true
    description?: true
    prompt?: true
    status?: true
    script?: true
    user_id?: true
    created_at?: true
    updated_at?: true
    scraped_content?: true
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
    scraped_at?: true
    scraped_url?: true
    video_type?: true
  }

  export type ProjectMaxAggregateInputType = {
    id?: true
    client_id?: true
    title?: true
    description?: true
    prompt?: true
    status?: true
    script?: true
    user_id?: true
    created_at?: true
    updated_at?: true
    scraped_content?: true
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
    scraped_at?: true
    scraped_url?: true
    video_type?: true
  }

  export type ProjectCountAggregateInputType = {
    id?: true
    client_id?: true
    title?: true
    description?: true
    documentation_urls?: true
    prompt?: true
    status?: true
    script?: true
    user_id?: true
    created_at?: true
    updated_at?: true
    scraped_content?: true
    scraped_pages?: true
    scraped_chars?: true
    scraped_words?: true
    scraped_at?: true
    scraped_url?: true
    video_type?: true
    _all?: true
  }

  export type ProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Project to aggregate.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Projects
    **/
    _count?: true | ProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProjectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProjectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProjectMaxAggregateInputType
  }

  export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProject[P]>
      : GetScalarType<T[P], AggregateProject[P]>
  }




  export type ProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithAggregationInput | ProjectOrderByWithAggregationInput[]
    by: ProjectScalarFieldEnum[] | ProjectScalarFieldEnum
    having?: ProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProjectCountAggregateInputType | true
    _avg?: ProjectAvgAggregateInputType
    _sum?: ProjectSumAggregateInputType
    _min?: ProjectMinAggregateInputType
    _max?: ProjectMaxAggregateInputType
  }

  export type ProjectGroupByOutputType = {
    id: string
    client_id: string
    title: string
    description: string
    documentation_urls: string[]
    prompt: string
    status: string
    script: string | null
    user_id: string
    created_at: Date
    updated_at: Date
    scraped_content: string | null
    scraped_pages: number | null
    scraped_chars: number | null
    scraped_words: number | null
    scraped_at: Date | null
    scraped_url: string | null
    video_type: string | null
    _count: ProjectCountAggregateOutputType | null
    _avg: ProjectAvgAggregateOutputType | null
    _sum: ProjectSumAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProjectGroupByOutputType[P]>
            : GetScalarType<T[P], ProjectGroupByOutputType[P]>
        }
      >
    >


  export type ProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    client_id?: boolean
    title?: boolean
    description?: boolean
    documentation_urls?: boolean
    prompt?: boolean
    status?: boolean
    script?: boolean
    user_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    scraped_content?: boolean
    scraped_pages?: boolean
    scraped_chars?: boolean
    scraped_words?: boolean
    scraped_at?: boolean
    scraped_url?: boolean
    video_type?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    client_id?: boolean
    title?: boolean
    description?: boolean
    documentation_urls?: boolean
    prompt?: boolean
    status?: boolean
    script?: boolean
    user_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    scraped_content?: boolean
    scraped_pages?: boolean
    scraped_chars?: boolean
    scraped_words?: boolean
    scraped_at?: boolean
    scraped_url?: boolean
    video_type?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    client_id?: boolean
    title?: boolean
    description?: boolean
    documentation_urls?: boolean
    prompt?: boolean
    status?: boolean
    script?: boolean
    user_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    scraped_content?: boolean
    scraped_pages?: boolean
    scraped_chars?: boolean
    scraped_words?: boolean
    scraped_at?: boolean
    scraped_url?: boolean
    video_type?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectScalar = {
    id?: boolean
    client_id?: boolean
    title?: boolean
    description?: boolean
    documentation_urls?: boolean
    prompt?: boolean
    status?: boolean
    script?: boolean
    user_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    scraped_content?: boolean
    scraped_pages?: boolean
    scraped_chars?: boolean
    scraped_words?: boolean
    scraped_at?: boolean
    scraped_url?: boolean
    video_type?: boolean
  }

  export type ProjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "client_id" | "title" | "description" | "documentation_urls" | "prompt" | "status" | "script" | "user_id" | "created_at" | "updated_at" | "scraped_content" | "scraped_pages" | "scraped_chars" | "scraped_words" | "scraped_at" | "scraped_url" | "video_type", ExtArgs["result"]["project"]>
  export type ProjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type ProjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type ProjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }

  export type $ProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Project"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      client: Prisma.$ClientPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      client_id: string
      title: string
      description: string
      documentation_urls: string[]
      prompt: string
      status: string
      script: string | null
      user_id: string
      created_at: Date
      updated_at: Date
      scraped_content: string | null
      scraped_pages: number | null
      scraped_chars: number | null
      scraped_words: number | null
      scraped_at: Date | null
      scraped_url: string | null
      video_type: string | null
    }, ExtArgs["result"]["project"]>
    composites: {}
  }

  type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = $Result.GetResult<Prisma.$ProjectPayload, S>

  type ProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProjectCountAggregateInputType | true
    }

  export interface ProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Project'], meta: { name: 'Project' } }
    /**
     * Find zero or one Project that matches the filter.
     * @param {ProjectFindUniqueArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectFindUniqueArgs>(args: SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectFindUniqueOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectFindFirstArgs>(args?: SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Projects
     * const projects = await prisma.project.findMany()
     * 
     * // Get first 10 Projects
     * const projects = await prisma.project.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const projectWithIdOnly = await prisma.project.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProjectFindManyArgs>(args?: SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Project.
     * @param {ProjectCreateArgs} args - Arguments to create a Project.
     * @example
     * // Create one Project
     * const Project = await prisma.project.create({
     *   data: {
     *     // ... data to create a Project
     *   }
     * })
     * 
     */
    create<T extends ProjectCreateArgs>(args: SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Projects.
     * @param {ProjectCreateManyArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProjectCreateManyArgs>(args?: SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Projects and returns the data saved in the database.
     * @param {ProjectCreateManyAndReturnArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Project.
     * @param {ProjectDeleteArgs} args - Arguments to delete one Project.
     * @example
     * // Delete one Project
     * const Project = await prisma.project.delete({
     *   where: {
     *     // ... filter to delete one Project
     *   }
     * })
     * 
     */
    delete<T extends ProjectDeleteArgs>(args: SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Project.
     * @param {ProjectUpdateArgs} args - Arguments to update one Project.
     * @example
     * // Update one Project
     * const project = await prisma.project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProjectUpdateArgs>(args: SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Projects.
     * @param {ProjectDeleteManyArgs} args - Arguments to filter Projects to delete.
     * @example
     * // Delete a few Projects
     * const { count } = await prisma.project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProjectDeleteManyArgs>(args?: SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProjectUpdateManyArgs>(args: SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects and returns the data updated in the database.
     * @param {ProjectUpdateManyAndReturnArgs} args - Arguments to update many Projects.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Project.
     * @param {ProjectUpsertArgs} args - Arguments to update or create a Project.
     * @example
     * // Update or create a Project
     * const project = await prisma.project.upsert({
     *   create: {
     *     // ... data to create a Project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project we want to update
     *   }
     * })
     */
    upsert<T extends ProjectUpsertArgs>(args: SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectCountArgs} args - Arguments to filter Projects to count.
     * @example
     * // Count the number of Projects
     * const count = await prisma.project.count({
     *   where: {
     *     // ... the filter for the Projects we want to count
     *   }
     * })
    **/
    count<T extends ProjectCountArgs>(
      args?: Subset<T, ProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProjectAggregateArgs>(args: Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>

    /**
     * Group by Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProjectGroupByArgs['orderBy'] }
        : { orderBy?: ProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Project model
   */
  readonly fields: ProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Project.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    client<T extends ClientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientDefaultArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Project model
   */
  interface ProjectFieldRefs {
    readonly id: FieldRef<"Project", 'String'>
    readonly client_id: FieldRef<"Project", 'String'>
    readonly title: FieldRef<"Project", 'String'>
    readonly description: FieldRef<"Project", 'String'>
    readonly documentation_urls: FieldRef<"Project", 'String[]'>
    readonly prompt: FieldRef<"Project", 'String'>
    readonly status: FieldRef<"Project", 'String'>
    readonly script: FieldRef<"Project", 'String'>
    readonly user_id: FieldRef<"Project", 'String'>
    readonly created_at: FieldRef<"Project", 'DateTime'>
    readonly updated_at: FieldRef<"Project", 'DateTime'>
    readonly scraped_content: FieldRef<"Project", 'String'>
    readonly scraped_pages: FieldRef<"Project", 'Int'>
    readonly scraped_chars: FieldRef<"Project", 'Int'>
    readonly scraped_words: FieldRef<"Project", 'Int'>
    readonly scraped_at: FieldRef<"Project", 'DateTime'>
    readonly scraped_url: FieldRef<"Project", 'String'>
    readonly video_type: FieldRef<"Project", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Project findUnique
   */
  export type ProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findUniqueOrThrow
   */
  export type ProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findFirst
   */
  export type ProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findFirstOrThrow
   */
  export type ProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findMany
   */
  export type ProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Projects to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project create
   */
  export type ProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to create a Project.
     */
    data: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
  }

  /**
   * Project createMany
   */
  export type ProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Project createManyAndReturn
   */
  export type ProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Project update
   */
  export type ProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to update a Project.
     */
    data: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
    /**
     * Choose, which Project to update.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project updateMany
   */
  export type ProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
  }

  /**
   * Project updateManyAndReturn
   */
  export type ProjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Project upsert
   */
  export type ProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The filter to search for the Project to update in case it exists.
     */
    where: ProjectWhereUniqueInput
    /**
     * In case the Project found by the `where` argument doesn't exist, create a new Project with this data.
     */
    create: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
    /**
     * In case the Project was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
  }

  /**
   * Project delete
   */
  export type ProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter which Project to delete.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project deleteMany
   */
  export type ProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Projects to delete
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to delete.
     */
    limit?: number
  }

  /**
   * Project without action
   */
  export type ProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
  }


  /**
   * Model LearningSession
   */

  export type AggregateLearningSession = {
    _count: LearningSessionCountAggregateOutputType | null
    _avg: LearningSessionAvgAggregateOutputType | null
    _sum: LearningSessionSumAggregateOutputType | null
    _min: LearningSessionMinAggregateOutputType | null
    _max: LearningSessionMaxAggregateOutputType | null
  }

  export type LearningSessionAvgAggregateOutputType = {
    completion_percentage: number | null
  }

  export type LearningSessionSumAggregateOutputType = {
    completion_percentage: number | null
  }

  export type LearningSessionMinAggregateOutputType = {
    id: string | null
    client_id: string | null
    user_id: string | null
    software_name: string | null
    documentation_summary: string | null
    current_phase: string | null
    completion_percentage: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type LearningSessionMaxAggregateOutputType = {
    id: string | null
    client_id: string | null
    user_id: string | null
    software_name: string | null
    documentation_summary: string | null
    current_phase: string | null
    completion_percentage: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type LearningSessionCountAggregateOutputType = {
    id: number
    client_id: number
    user_id: number
    software_name: number
    documentation_summary: number
    current_phase: number
    completion_percentage: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type LearningSessionAvgAggregateInputType = {
    completion_percentage?: true
  }

  export type LearningSessionSumAggregateInputType = {
    completion_percentage?: true
  }

  export type LearningSessionMinAggregateInputType = {
    id?: true
    client_id?: true
    user_id?: true
    software_name?: true
    documentation_summary?: true
    current_phase?: true
    completion_percentage?: true
    created_at?: true
    updated_at?: true
  }

  export type LearningSessionMaxAggregateInputType = {
    id?: true
    client_id?: true
    user_id?: true
    software_name?: true
    documentation_summary?: true
    current_phase?: true
    completion_percentage?: true
    created_at?: true
    updated_at?: true
  }

  export type LearningSessionCountAggregateInputType = {
    id?: true
    client_id?: true
    user_id?: true
    software_name?: true
    documentation_summary?: true
    current_phase?: true
    completion_percentage?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type LearningSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearningSession to aggregate.
     */
    where?: LearningSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningSessions to fetch.
     */
    orderBy?: LearningSessionOrderByWithRelationInput | LearningSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LearningSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LearningSessions
    **/
    _count?: true | LearningSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LearningSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LearningSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LearningSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LearningSessionMaxAggregateInputType
  }

  export type GetLearningSessionAggregateType<T extends LearningSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateLearningSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLearningSession[P]>
      : GetScalarType<T[P], AggregateLearningSession[P]>
  }




  export type LearningSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningSessionWhereInput
    orderBy?: LearningSessionOrderByWithAggregationInput | LearningSessionOrderByWithAggregationInput[]
    by: LearningSessionScalarFieldEnum[] | LearningSessionScalarFieldEnum
    having?: LearningSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LearningSessionCountAggregateInputType | true
    _avg?: LearningSessionAvgAggregateInputType
    _sum?: LearningSessionSumAggregateInputType
    _min?: LearningSessionMinAggregateInputType
    _max?: LearningSessionMaxAggregateInputType
  }

  export type LearningSessionGroupByOutputType = {
    id: string
    client_id: string
    user_id: string
    software_name: string
    documentation_summary: string | null
    current_phase: string
    completion_percentage: number
    created_at: Date
    updated_at: Date
    _count: LearningSessionCountAggregateOutputType | null
    _avg: LearningSessionAvgAggregateOutputType | null
    _sum: LearningSessionSumAggregateOutputType | null
    _min: LearningSessionMinAggregateOutputType | null
    _max: LearningSessionMaxAggregateOutputType | null
  }

  type GetLearningSessionGroupByPayload<T extends LearningSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LearningSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LearningSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LearningSessionGroupByOutputType[P]>
            : GetScalarType<T[P], LearningSessionGroupByOutputType[P]>
        }
      >
    >


  export type LearningSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    client_id?: boolean
    user_id?: boolean
    software_name?: boolean
    documentation_summary?: boolean
    current_phase?: boolean
    completion_percentage?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    tasks?: boolean | LearningSession$tasksArgs<ExtArgs>
    progress?: boolean | LearningSession$progressArgs<ExtArgs>
    chat_messages?: boolean | LearningSession$chat_messagesArgs<ExtArgs>
    _count?: boolean | LearningSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningSession"]>

  export type LearningSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    client_id?: boolean
    user_id?: boolean
    software_name?: boolean
    documentation_summary?: boolean
    current_phase?: boolean
    completion_percentage?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningSession"]>

  export type LearningSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    client_id?: boolean
    user_id?: boolean
    software_name?: boolean
    documentation_summary?: boolean
    current_phase?: boolean
    completion_percentage?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningSession"]>

  export type LearningSessionSelectScalar = {
    id?: boolean
    client_id?: boolean
    user_id?: boolean
    software_name?: boolean
    documentation_summary?: boolean
    current_phase?: boolean
    completion_percentage?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type LearningSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "client_id" | "user_id" | "software_name" | "documentation_summary" | "current_phase" | "completion_percentage" | "created_at" | "updated_at", ExtArgs["result"]["learningSession"]>
  export type LearningSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    tasks?: boolean | LearningSession$tasksArgs<ExtArgs>
    progress?: boolean | LearningSession$progressArgs<ExtArgs>
    chat_messages?: boolean | LearningSession$chat_messagesArgs<ExtArgs>
    _count?: boolean | LearningSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LearningSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type LearningSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }

  export type $LearningSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LearningSession"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      client: Prisma.$ClientPayload<ExtArgs>
      tasks: Prisma.$LearningTaskPayload<ExtArgs>[]
      progress: Prisma.$LearningProgressPayload<ExtArgs>[]
      chat_messages: Prisma.$LearningChatMessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      client_id: string
      user_id: string
      software_name: string
      documentation_summary: string | null
      current_phase: string
      completion_percentage: number
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["learningSession"]>
    composites: {}
  }

  type LearningSessionGetPayload<S extends boolean | null | undefined | LearningSessionDefaultArgs> = $Result.GetResult<Prisma.$LearningSessionPayload, S>

  type LearningSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LearningSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LearningSessionCountAggregateInputType | true
    }

  export interface LearningSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LearningSession'], meta: { name: 'LearningSession' } }
    /**
     * Find zero or one LearningSession that matches the filter.
     * @param {LearningSessionFindUniqueArgs} args - Arguments to find a LearningSession
     * @example
     * // Get one LearningSession
     * const learningSession = await prisma.learningSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LearningSessionFindUniqueArgs>(args: SelectSubset<T, LearningSessionFindUniqueArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LearningSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LearningSessionFindUniqueOrThrowArgs} args - Arguments to find a LearningSession
     * @example
     * // Get one LearningSession
     * const learningSession = await prisma.learningSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LearningSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, LearningSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearningSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningSessionFindFirstArgs} args - Arguments to find a LearningSession
     * @example
     * // Get one LearningSession
     * const learningSession = await prisma.learningSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LearningSessionFindFirstArgs>(args?: SelectSubset<T, LearningSessionFindFirstArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearningSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningSessionFindFirstOrThrowArgs} args - Arguments to find a LearningSession
     * @example
     * // Get one LearningSession
     * const learningSession = await prisma.learningSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LearningSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, LearningSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LearningSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LearningSessions
     * const learningSessions = await prisma.learningSession.findMany()
     * 
     * // Get first 10 LearningSessions
     * const learningSessions = await prisma.learningSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const learningSessionWithIdOnly = await prisma.learningSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LearningSessionFindManyArgs>(args?: SelectSubset<T, LearningSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LearningSession.
     * @param {LearningSessionCreateArgs} args - Arguments to create a LearningSession.
     * @example
     * // Create one LearningSession
     * const LearningSession = await prisma.learningSession.create({
     *   data: {
     *     // ... data to create a LearningSession
     *   }
     * })
     * 
     */
    create<T extends LearningSessionCreateArgs>(args: SelectSubset<T, LearningSessionCreateArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LearningSessions.
     * @param {LearningSessionCreateManyArgs} args - Arguments to create many LearningSessions.
     * @example
     * // Create many LearningSessions
     * const learningSession = await prisma.learningSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LearningSessionCreateManyArgs>(args?: SelectSubset<T, LearningSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LearningSessions and returns the data saved in the database.
     * @param {LearningSessionCreateManyAndReturnArgs} args - Arguments to create many LearningSessions.
     * @example
     * // Create many LearningSessions
     * const learningSession = await prisma.learningSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LearningSessions and only return the `id`
     * const learningSessionWithIdOnly = await prisma.learningSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LearningSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, LearningSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LearningSession.
     * @param {LearningSessionDeleteArgs} args - Arguments to delete one LearningSession.
     * @example
     * // Delete one LearningSession
     * const LearningSession = await prisma.learningSession.delete({
     *   where: {
     *     // ... filter to delete one LearningSession
     *   }
     * })
     * 
     */
    delete<T extends LearningSessionDeleteArgs>(args: SelectSubset<T, LearningSessionDeleteArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LearningSession.
     * @param {LearningSessionUpdateArgs} args - Arguments to update one LearningSession.
     * @example
     * // Update one LearningSession
     * const learningSession = await prisma.learningSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LearningSessionUpdateArgs>(args: SelectSubset<T, LearningSessionUpdateArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LearningSessions.
     * @param {LearningSessionDeleteManyArgs} args - Arguments to filter LearningSessions to delete.
     * @example
     * // Delete a few LearningSessions
     * const { count } = await prisma.learningSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LearningSessionDeleteManyArgs>(args?: SelectSubset<T, LearningSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearningSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LearningSessions
     * const learningSession = await prisma.learningSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LearningSessionUpdateManyArgs>(args: SelectSubset<T, LearningSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearningSessions and returns the data updated in the database.
     * @param {LearningSessionUpdateManyAndReturnArgs} args - Arguments to update many LearningSessions.
     * @example
     * // Update many LearningSessions
     * const learningSession = await prisma.learningSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LearningSessions and only return the `id`
     * const learningSessionWithIdOnly = await prisma.learningSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LearningSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, LearningSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LearningSession.
     * @param {LearningSessionUpsertArgs} args - Arguments to update or create a LearningSession.
     * @example
     * // Update or create a LearningSession
     * const learningSession = await prisma.learningSession.upsert({
     *   create: {
     *     // ... data to create a LearningSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LearningSession we want to update
     *   }
     * })
     */
    upsert<T extends LearningSessionUpsertArgs>(args: SelectSubset<T, LearningSessionUpsertArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LearningSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningSessionCountArgs} args - Arguments to filter LearningSessions to count.
     * @example
     * // Count the number of LearningSessions
     * const count = await prisma.learningSession.count({
     *   where: {
     *     // ... the filter for the LearningSessions we want to count
     *   }
     * })
    **/
    count<T extends LearningSessionCountArgs>(
      args?: Subset<T, LearningSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LearningSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LearningSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LearningSessionAggregateArgs>(args: Subset<T, LearningSessionAggregateArgs>): Prisma.PrismaPromise<GetLearningSessionAggregateType<T>>

    /**
     * Group by LearningSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LearningSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LearningSessionGroupByArgs['orderBy'] }
        : { orderBy?: LearningSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LearningSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLearningSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LearningSession model
   */
  readonly fields: LearningSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LearningSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LearningSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    client<T extends ClientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientDefaultArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    tasks<T extends LearningSession$tasksArgs<ExtArgs> = {}>(args?: Subset<T, LearningSession$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    progress<T extends LearningSession$progressArgs<ExtArgs> = {}>(args?: Subset<T, LearningSession$progressArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    chat_messages<T extends LearningSession$chat_messagesArgs<ExtArgs> = {}>(args?: Subset<T, LearningSession$chat_messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LearningSession model
   */
  interface LearningSessionFieldRefs {
    readonly id: FieldRef<"LearningSession", 'String'>
    readonly client_id: FieldRef<"LearningSession", 'String'>
    readonly user_id: FieldRef<"LearningSession", 'String'>
    readonly software_name: FieldRef<"LearningSession", 'String'>
    readonly documentation_summary: FieldRef<"LearningSession", 'String'>
    readonly current_phase: FieldRef<"LearningSession", 'String'>
    readonly completion_percentage: FieldRef<"LearningSession", 'Float'>
    readonly created_at: FieldRef<"LearningSession", 'DateTime'>
    readonly updated_at: FieldRef<"LearningSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LearningSession findUnique
   */
  export type LearningSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which LearningSession to fetch.
     */
    where: LearningSessionWhereUniqueInput
  }

  /**
   * LearningSession findUniqueOrThrow
   */
  export type LearningSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which LearningSession to fetch.
     */
    where: LearningSessionWhereUniqueInput
  }

  /**
   * LearningSession findFirst
   */
  export type LearningSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which LearningSession to fetch.
     */
    where?: LearningSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningSessions to fetch.
     */
    orderBy?: LearningSessionOrderByWithRelationInput | LearningSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearningSessions.
     */
    cursor?: LearningSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearningSessions.
     */
    distinct?: LearningSessionScalarFieldEnum | LearningSessionScalarFieldEnum[]
  }

  /**
   * LearningSession findFirstOrThrow
   */
  export type LearningSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which LearningSession to fetch.
     */
    where?: LearningSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningSessions to fetch.
     */
    orderBy?: LearningSessionOrderByWithRelationInput | LearningSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearningSessions.
     */
    cursor?: LearningSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearningSessions.
     */
    distinct?: LearningSessionScalarFieldEnum | LearningSessionScalarFieldEnum[]
  }

  /**
   * LearningSession findMany
   */
  export type LearningSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * Filter, which LearningSessions to fetch.
     */
    where?: LearningSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningSessions to fetch.
     */
    orderBy?: LearningSessionOrderByWithRelationInput | LearningSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LearningSessions.
     */
    cursor?: LearningSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningSessions.
     */
    skip?: number
    distinct?: LearningSessionScalarFieldEnum | LearningSessionScalarFieldEnum[]
  }

  /**
   * LearningSession create
   */
  export type LearningSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a LearningSession.
     */
    data: XOR<LearningSessionCreateInput, LearningSessionUncheckedCreateInput>
  }

  /**
   * LearningSession createMany
   */
  export type LearningSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LearningSessions.
     */
    data: LearningSessionCreateManyInput | LearningSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LearningSession createManyAndReturn
   */
  export type LearningSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * The data used to create many LearningSessions.
     */
    data: LearningSessionCreateManyInput | LearningSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearningSession update
   */
  export type LearningSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a LearningSession.
     */
    data: XOR<LearningSessionUpdateInput, LearningSessionUncheckedUpdateInput>
    /**
     * Choose, which LearningSession to update.
     */
    where: LearningSessionWhereUniqueInput
  }

  /**
   * LearningSession updateMany
   */
  export type LearningSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LearningSessions.
     */
    data: XOR<LearningSessionUpdateManyMutationInput, LearningSessionUncheckedUpdateManyInput>
    /**
     * Filter which LearningSessions to update
     */
    where?: LearningSessionWhereInput
    /**
     * Limit how many LearningSessions to update.
     */
    limit?: number
  }

  /**
   * LearningSession updateManyAndReturn
   */
  export type LearningSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * The data used to update LearningSessions.
     */
    data: XOR<LearningSessionUpdateManyMutationInput, LearningSessionUncheckedUpdateManyInput>
    /**
     * Filter which LearningSessions to update
     */
    where?: LearningSessionWhereInput
    /**
     * Limit how many LearningSessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearningSession upsert
   */
  export type LearningSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the LearningSession to update in case it exists.
     */
    where: LearningSessionWhereUniqueInput
    /**
     * In case the LearningSession found by the `where` argument doesn't exist, create a new LearningSession with this data.
     */
    create: XOR<LearningSessionCreateInput, LearningSessionUncheckedCreateInput>
    /**
     * In case the LearningSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LearningSessionUpdateInput, LearningSessionUncheckedUpdateInput>
  }

  /**
   * LearningSession delete
   */
  export type LearningSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
    /**
     * Filter which LearningSession to delete.
     */
    where: LearningSessionWhereUniqueInput
  }

  /**
   * LearningSession deleteMany
   */
  export type LearningSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearningSessions to delete
     */
    where?: LearningSessionWhereInput
    /**
     * Limit how many LearningSessions to delete.
     */
    limit?: number
  }

  /**
   * LearningSession.tasks
   */
  export type LearningSession$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    where?: LearningTaskWhereInput
    orderBy?: LearningTaskOrderByWithRelationInput | LearningTaskOrderByWithRelationInput[]
    cursor?: LearningTaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LearningTaskScalarFieldEnum | LearningTaskScalarFieldEnum[]
  }

  /**
   * LearningSession.progress
   */
  export type LearningSession$progressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    where?: LearningProgressWhereInput
    orderBy?: LearningProgressOrderByWithRelationInput | LearningProgressOrderByWithRelationInput[]
    cursor?: LearningProgressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LearningProgressScalarFieldEnum | LearningProgressScalarFieldEnum[]
  }

  /**
   * LearningSession.chat_messages
   */
  export type LearningSession$chat_messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    where?: LearningChatMessageWhereInput
    orderBy?: LearningChatMessageOrderByWithRelationInput | LearningChatMessageOrderByWithRelationInput[]
    cursor?: LearningChatMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LearningChatMessageScalarFieldEnum | LearningChatMessageScalarFieldEnum[]
  }

  /**
   * LearningSession without action
   */
  export type LearningSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningSession
     */
    select?: LearningSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningSession
     */
    omit?: LearningSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningSessionInclude<ExtArgs> | null
  }


  /**
   * Model LearningTask
   */

  export type AggregateLearningTask = {
    _count: LearningTaskCountAggregateOutputType | null
    _avg: LearningTaskAvgAggregateOutputType | null
    _sum: LearningTaskSumAggregateOutputType | null
    _min: LearningTaskMinAggregateOutputType | null
    _max: LearningTaskMaxAggregateOutputType | null
  }

  export type LearningTaskAvgAggregateOutputType = {
    difficulty_level: number | null
    estimated_minutes: number | null
  }

  export type LearningTaskSumAggregateOutputType = {
    difficulty_level: number | null
    estimated_minutes: number | null
  }

  export type LearningTaskMinAggregateOutputType = {
    id: string | null
    learning_session_id: string | null
    title: string | null
    description: string | null
    instructions: string | null
    category: string | null
    difficulty_level: number | null
    estimated_minutes: number | null
    is_completed: boolean | null
    completed_at: Date | null
    user_notes: string | null
    created_at: Date | null
  }

  export type LearningTaskMaxAggregateOutputType = {
    id: string | null
    learning_session_id: string | null
    title: string | null
    description: string | null
    instructions: string | null
    category: string | null
    difficulty_level: number | null
    estimated_minutes: number | null
    is_completed: boolean | null
    completed_at: Date | null
    user_notes: string | null
    created_at: Date | null
  }

  export type LearningTaskCountAggregateOutputType = {
    id: number
    learning_session_id: number
    title: number
    description: number
    instructions: number
    category: number
    difficulty_level: number
    estimated_minutes: number
    prerequisites: number
    is_completed: number
    completed_at: number
    user_notes: number
    created_at: number
    _all: number
  }


  export type LearningTaskAvgAggregateInputType = {
    difficulty_level?: true
    estimated_minutes?: true
  }

  export type LearningTaskSumAggregateInputType = {
    difficulty_level?: true
    estimated_minutes?: true
  }

  export type LearningTaskMinAggregateInputType = {
    id?: true
    learning_session_id?: true
    title?: true
    description?: true
    instructions?: true
    category?: true
    difficulty_level?: true
    estimated_minutes?: true
    is_completed?: true
    completed_at?: true
    user_notes?: true
    created_at?: true
  }

  export type LearningTaskMaxAggregateInputType = {
    id?: true
    learning_session_id?: true
    title?: true
    description?: true
    instructions?: true
    category?: true
    difficulty_level?: true
    estimated_minutes?: true
    is_completed?: true
    completed_at?: true
    user_notes?: true
    created_at?: true
  }

  export type LearningTaskCountAggregateInputType = {
    id?: true
    learning_session_id?: true
    title?: true
    description?: true
    instructions?: true
    category?: true
    difficulty_level?: true
    estimated_minutes?: true
    prerequisites?: true
    is_completed?: true
    completed_at?: true
    user_notes?: true
    created_at?: true
    _all?: true
  }

  export type LearningTaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearningTask to aggregate.
     */
    where?: LearningTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningTasks to fetch.
     */
    orderBy?: LearningTaskOrderByWithRelationInput | LearningTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LearningTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LearningTasks
    **/
    _count?: true | LearningTaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LearningTaskAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LearningTaskSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LearningTaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LearningTaskMaxAggregateInputType
  }

  export type GetLearningTaskAggregateType<T extends LearningTaskAggregateArgs> = {
        [P in keyof T & keyof AggregateLearningTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLearningTask[P]>
      : GetScalarType<T[P], AggregateLearningTask[P]>
  }




  export type LearningTaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningTaskWhereInput
    orderBy?: LearningTaskOrderByWithAggregationInput | LearningTaskOrderByWithAggregationInput[]
    by: LearningTaskScalarFieldEnum[] | LearningTaskScalarFieldEnum
    having?: LearningTaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LearningTaskCountAggregateInputType | true
    _avg?: LearningTaskAvgAggregateInputType
    _sum?: LearningTaskSumAggregateInputType
    _min?: LearningTaskMinAggregateInputType
    _max?: LearningTaskMaxAggregateInputType
  }

  export type LearningTaskGroupByOutputType = {
    id: string
    learning_session_id: string
    title: string
    description: string
    instructions: string
    category: string
    difficulty_level: number
    estimated_minutes: number | null
    prerequisites: string[]
    is_completed: boolean
    completed_at: Date | null
    user_notes: string | null
    created_at: Date
    _count: LearningTaskCountAggregateOutputType | null
    _avg: LearningTaskAvgAggregateOutputType | null
    _sum: LearningTaskSumAggregateOutputType | null
    _min: LearningTaskMinAggregateOutputType | null
    _max: LearningTaskMaxAggregateOutputType | null
  }

  type GetLearningTaskGroupByPayload<T extends LearningTaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LearningTaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LearningTaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LearningTaskGroupByOutputType[P]>
            : GetScalarType<T[P], LearningTaskGroupByOutputType[P]>
        }
      >
    >


  export type LearningTaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    title?: boolean
    description?: boolean
    instructions?: boolean
    category?: boolean
    difficulty_level?: boolean
    estimated_minutes?: boolean
    prerequisites?: boolean
    is_completed?: boolean
    completed_at?: boolean
    user_notes?: boolean
    created_at?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningTask"]>

  export type LearningTaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    title?: boolean
    description?: boolean
    instructions?: boolean
    category?: boolean
    difficulty_level?: boolean
    estimated_minutes?: boolean
    prerequisites?: boolean
    is_completed?: boolean
    completed_at?: boolean
    user_notes?: boolean
    created_at?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningTask"]>

  export type LearningTaskSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    title?: boolean
    description?: boolean
    instructions?: boolean
    category?: boolean
    difficulty_level?: boolean
    estimated_minutes?: boolean
    prerequisites?: boolean
    is_completed?: boolean
    completed_at?: boolean
    user_notes?: boolean
    created_at?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningTask"]>

  export type LearningTaskSelectScalar = {
    id?: boolean
    learning_session_id?: boolean
    title?: boolean
    description?: boolean
    instructions?: boolean
    category?: boolean
    difficulty_level?: boolean
    estimated_minutes?: boolean
    prerequisites?: boolean
    is_completed?: boolean
    completed_at?: boolean
    user_notes?: boolean
    created_at?: boolean
  }

  export type LearningTaskOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "learning_session_id" | "title" | "description" | "instructions" | "category" | "difficulty_level" | "estimated_minutes" | "prerequisites" | "is_completed" | "completed_at" | "user_notes" | "created_at", ExtArgs["result"]["learningTask"]>
  export type LearningTaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }
  export type LearningTaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }
  export type LearningTaskIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }

  export type $LearningTaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LearningTask"
    objects: {
      learning_session: Prisma.$LearningSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      learning_session_id: string
      title: string
      description: string
      instructions: string
      category: string
      difficulty_level: number
      estimated_minutes: number | null
      prerequisites: string[]
      is_completed: boolean
      completed_at: Date | null
      user_notes: string | null
      created_at: Date
    }, ExtArgs["result"]["learningTask"]>
    composites: {}
  }

  type LearningTaskGetPayload<S extends boolean | null | undefined | LearningTaskDefaultArgs> = $Result.GetResult<Prisma.$LearningTaskPayload, S>

  type LearningTaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LearningTaskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LearningTaskCountAggregateInputType | true
    }

  export interface LearningTaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LearningTask'], meta: { name: 'LearningTask' } }
    /**
     * Find zero or one LearningTask that matches the filter.
     * @param {LearningTaskFindUniqueArgs} args - Arguments to find a LearningTask
     * @example
     * // Get one LearningTask
     * const learningTask = await prisma.learningTask.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LearningTaskFindUniqueArgs>(args: SelectSubset<T, LearningTaskFindUniqueArgs<ExtArgs>>): Prisma__LearningTaskClient<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LearningTask that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LearningTaskFindUniqueOrThrowArgs} args - Arguments to find a LearningTask
     * @example
     * // Get one LearningTask
     * const learningTask = await prisma.learningTask.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LearningTaskFindUniqueOrThrowArgs>(args: SelectSubset<T, LearningTaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LearningTaskClient<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearningTask that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningTaskFindFirstArgs} args - Arguments to find a LearningTask
     * @example
     * // Get one LearningTask
     * const learningTask = await prisma.learningTask.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LearningTaskFindFirstArgs>(args?: SelectSubset<T, LearningTaskFindFirstArgs<ExtArgs>>): Prisma__LearningTaskClient<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearningTask that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningTaskFindFirstOrThrowArgs} args - Arguments to find a LearningTask
     * @example
     * // Get one LearningTask
     * const learningTask = await prisma.learningTask.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LearningTaskFindFirstOrThrowArgs>(args?: SelectSubset<T, LearningTaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__LearningTaskClient<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LearningTasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningTaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LearningTasks
     * const learningTasks = await prisma.learningTask.findMany()
     * 
     * // Get first 10 LearningTasks
     * const learningTasks = await prisma.learningTask.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const learningTaskWithIdOnly = await prisma.learningTask.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LearningTaskFindManyArgs>(args?: SelectSubset<T, LearningTaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LearningTask.
     * @param {LearningTaskCreateArgs} args - Arguments to create a LearningTask.
     * @example
     * // Create one LearningTask
     * const LearningTask = await prisma.learningTask.create({
     *   data: {
     *     // ... data to create a LearningTask
     *   }
     * })
     * 
     */
    create<T extends LearningTaskCreateArgs>(args: SelectSubset<T, LearningTaskCreateArgs<ExtArgs>>): Prisma__LearningTaskClient<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LearningTasks.
     * @param {LearningTaskCreateManyArgs} args - Arguments to create many LearningTasks.
     * @example
     * // Create many LearningTasks
     * const learningTask = await prisma.learningTask.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LearningTaskCreateManyArgs>(args?: SelectSubset<T, LearningTaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LearningTasks and returns the data saved in the database.
     * @param {LearningTaskCreateManyAndReturnArgs} args - Arguments to create many LearningTasks.
     * @example
     * // Create many LearningTasks
     * const learningTask = await prisma.learningTask.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LearningTasks and only return the `id`
     * const learningTaskWithIdOnly = await prisma.learningTask.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LearningTaskCreateManyAndReturnArgs>(args?: SelectSubset<T, LearningTaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LearningTask.
     * @param {LearningTaskDeleteArgs} args - Arguments to delete one LearningTask.
     * @example
     * // Delete one LearningTask
     * const LearningTask = await prisma.learningTask.delete({
     *   where: {
     *     // ... filter to delete one LearningTask
     *   }
     * })
     * 
     */
    delete<T extends LearningTaskDeleteArgs>(args: SelectSubset<T, LearningTaskDeleteArgs<ExtArgs>>): Prisma__LearningTaskClient<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LearningTask.
     * @param {LearningTaskUpdateArgs} args - Arguments to update one LearningTask.
     * @example
     * // Update one LearningTask
     * const learningTask = await prisma.learningTask.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LearningTaskUpdateArgs>(args: SelectSubset<T, LearningTaskUpdateArgs<ExtArgs>>): Prisma__LearningTaskClient<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LearningTasks.
     * @param {LearningTaskDeleteManyArgs} args - Arguments to filter LearningTasks to delete.
     * @example
     * // Delete a few LearningTasks
     * const { count } = await prisma.learningTask.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LearningTaskDeleteManyArgs>(args?: SelectSubset<T, LearningTaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearningTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningTaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LearningTasks
     * const learningTask = await prisma.learningTask.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LearningTaskUpdateManyArgs>(args: SelectSubset<T, LearningTaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearningTasks and returns the data updated in the database.
     * @param {LearningTaskUpdateManyAndReturnArgs} args - Arguments to update many LearningTasks.
     * @example
     * // Update many LearningTasks
     * const learningTask = await prisma.learningTask.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LearningTasks and only return the `id`
     * const learningTaskWithIdOnly = await prisma.learningTask.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LearningTaskUpdateManyAndReturnArgs>(args: SelectSubset<T, LearningTaskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LearningTask.
     * @param {LearningTaskUpsertArgs} args - Arguments to update or create a LearningTask.
     * @example
     * // Update or create a LearningTask
     * const learningTask = await prisma.learningTask.upsert({
     *   create: {
     *     // ... data to create a LearningTask
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LearningTask we want to update
     *   }
     * })
     */
    upsert<T extends LearningTaskUpsertArgs>(args: SelectSubset<T, LearningTaskUpsertArgs<ExtArgs>>): Prisma__LearningTaskClient<$Result.GetResult<Prisma.$LearningTaskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LearningTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningTaskCountArgs} args - Arguments to filter LearningTasks to count.
     * @example
     * // Count the number of LearningTasks
     * const count = await prisma.learningTask.count({
     *   where: {
     *     // ... the filter for the LearningTasks we want to count
     *   }
     * })
    **/
    count<T extends LearningTaskCountArgs>(
      args?: Subset<T, LearningTaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LearningTaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LearningTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningTaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LearningTaskAggregateArgs>(args: Subset<T, LearningTaskAggregateArgs>): Prisma.PrismaPromise<GetLearningTaskAggregateType<T>>

    /**
     * Group by LearningTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningTaskGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LearningTaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LearningTaskGroupByArgs['orderBy'] }
        : { orderBy?: LearningTaskGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LearningTaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLearningTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LearningTask model
   */
  readonly fields: LearningTaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LearningTask.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LearningTaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    learning_session<T extends LearningSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LearningSessionDefaultArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LearningTask model
   */
  interface LearningTaskFieldRefs {
    readonly id: FieldRef<"LearningTask", 'String'>
    readonly learning_session_id: FieldRef<"LearningTask", 'String'>
    readonly title: FieldRef<"LearningTask", 'String'>
    readonly description: FieldRef<"LearningTask", 'String'>
    readonly instructions: FieldRef<"LearningTask", 'String'>
    readonly category: FieldRef<"LearningTask", 'String'>
    readonly difficulty_level: FieldRef<"LearningTask", 'Int'>
    readonly estimated_minutes: FieldRef<"LearningTask", 'Int'>
    readonly prerequisites: FieldRef<"LearningTask", 'String[]'>
    readonly is_completed: FieldRef<"LearningTask", 'Boolean'>
    readonly completed_at: FieldRef<"LearningTask", 'DateTime'>
    readonly user_notes: FieldRef<"LearningTask", 'String'>
    readonly created_at: FieldRef<"LearningTask", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LearningTask findUnique
   */
  export type LearningTaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * Filter, which LearningTask to fetch.
     */
    where: LearningTaskWhereUniqueInput
  }

  /**
   * LearningTask findUniqueOrThrow
   */
  export type LearningTaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * Filter, which LearningTask to fetch.
     */
    where: LearningTaskWhereUniqueInput
  }

  /**
   * LearningTask findFirst
   */
  export type LearningTaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * Filter, which LearningTask to fetch.
     */
    where?: LearningTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningTasks to fetch.
     */
    orderBy?: LearningTaskOrderByWithRelationInput | LearningTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearningTasks.
     */
    cursor?: LearningTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearningTasks.
     */
    distinct?: LearningTaskScalarFieldEnum | LearningTaskScalarFieldEnum[]
  }

  /**
   * LearningTask findFirstOrThrow
   */
  export type LearningTaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * Filter, which LearningTask to fetch.
     */
    where?: LearningTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningTasks to fetch.
     */
    orderBy?: LearningTaskOrderByWithRelationInput | LearningTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearningTasks.
     */
    cursor?: LearningTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearningTasks.
     */
    distinct?: LearningTaskScalarFieldEnum | LearningTaskScalarFieldEnum[]
  }

  /**
   * LearningTask findMany
   */
  export type LearningTaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * Filter, which LearningTasks to fetch.
     */
    where?: LearningTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningTasks to fetch.
     */
    orderBy?: LearningTaskOrderByWithRelationInput | LearningTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LearningTasks.
     */
    cursor?: LearningTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningTasks.
     */
    skip?: number
    distinct?: LearningTaskScalarFieldEnum | LearningTaskScalarFieldEnum[]
  }

  /**
   * LearningTask create
   */
  export type LearningTaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * The data needed to create a LearningTask.
     */
    data: XOR<LearningTaskCreateInput, LearningTaskUncheckedCreateInput>
  }

  /**
   * LearningTask createMany
   */
  export type LearningTaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LearningTasks.
     */
    data: LearningTaskCreateManyInput | LearningTaskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LearningTask createManyAndReturn
   */
  export type LearningTaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * The data used to create many LearningTasks.
     */
    data: LearningTaskCreateManyInput | LearningTaskCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearningTask update
   */
  export type LearningTaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * The data needed to update a LearningTask.
     */
    data: XOR<LearningTaskUpdateInput, LearningTaskUncheckedUpdateInput>
    /**
     * Choose, which LearningTask to update.
     */
    where: LearningTaskWhereUniqueInput
  }

  /**
   * LearningTask updateMany
   */
  export type LearningTaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LearningTasks.
     */
    data: XOR<LearningTaskUpdateManyMutationInput, LearningTaskUncheckedUpdateManyInput>
    /**
     * Filter which LearningTasks to update
     */
    where?: LearningTaskWhereInput
    /**
     * Limit how many LearningTasks to update.
     */
    limit?: number
  }

  /**
   * LearningTask updateManyAndReturn
   */
  export type LearningTaskUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * The data used to update LearningTasks.
     */
    data: XOR<LearningTaskUpdateManyMutationInput, LearningTaskUncheckedUpdateManyInput>
    /**
     * Filter which LearningTasks to update
     */
    where?: LearningTaskWhereInput
    /**
     * Limit how many LearningTasks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearningTask upsert
   */
  export type LearningTaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * The filter to search for the LearningTask to update in case it exists.
     */
    where: LearningTaskWhereUniqueInput
    /**
     * In case the LearningTask found by the `where` argument doesn't exist, create a new LearningTask with this data.
     */
    create: XOR<LearningTaskCreateInput, LearningTaskUncheckedCreateInput>
    /**
     * In case the LearningTask was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LearningTaskUpdateInput, LearningTaskUncheckedUpdateInput>
  }

  /**
   * LearningTask delete
   */
  export type LearningTaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
    /**
     * Filter which LearningTask to delete.
     */
    where: LearningTaskWhereUniqueInput
  }

  /**
   * LearningTask deleteMany
   */
  export type LearningTaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearningTasks to delete
     */
    where?: LearningTaskWhereInput
    /**
     * Limit how many LearningTasks to delete.
     */
    limit?: number
  }

  /**
   * LearningTask without action
   */
  export type LearningTaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningTask
     */
    select?: LearningTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningTask
     */
    omit?: LearningTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningTaskInclude<ExtArgs> | null
  }


  /**
   * Model LearningProgress
   */

  export type AggregateLearningProgress = {
    _count: LearningProgressCountAggregateOutputType | null
    _avg: LearningProgressAvgAggregateOutputType | null
    _sum: LearningProgressSumAggregateOutputType | null
    _min: LearningProgressMinAggregateOutputType | null
    _max: LearningProgressMaxAggregateOutputType | null
  }

  export type LearningProgressAvgAggregateOutputType = {
    mastery_level: number | null
    tasks_completed: number | null
    total_tasks: number | null
  }

  export type LearningProgressSumAggregateOutputType = {
    mastery_level: number | null
    tasks_completed: number | null
    total_tasks: number | null
  }

  export type LearningProgressMinAggregateOutputType = {
    id: string | null
    learning_session_id: string | null
    category: string | null
    mastery_level: number | null
    tasks_completed: number | null
    total_tasks: number | null
    last_activity: Date | null
  }

  export type LearningProgressMaxAggregateOutputType = {
    id: string | null
    learning_session_id: string | null
    category: string | null
    mastery_level: number | null
    tasks_completed: number | null
    total_tasks: number | null
    last_activity: Date | null
  }

  export type LearningProgressCountAggregateOutputType = {
    id: number
    learning_session_id: number
    category: number
    mastery_level: number
    tasks_completed: number
    total_tasks: number
    last_activity: number
    _all: number
  }


  export type LearningProgressAvgAggregateInputType = {
    mastery_level?: true
    tasks_completed?: true
    total_tasks?: true
  }

  export type LearningProgressSumAggregateInputType = {
    mastery_level?: true
    tasks_completed?: true
    total_tasks?: true
  }

  export type LearningProgressMinAggregateInputType = {
    id?: true
    learning_session_id?: true
    category?: true
    mastery_level?: true
    tasks_completed?: true
    total_tasks?: true
    last_activity?: true
  }

  export type LearningProgressMaxAggregateInputType = {
    id?: true
    learning_session_id?: true
    category?: true
    mastery_level?: true
    tasks_completed?: true
    total_tasks?: true
    last_activity?: true
  }

  export type LearningProgressCountAggregateInputType = {
    id?: true
    learning_session_id?: true
    category?: true
    mastery_level?: true
    tasks_completed?: true
    total_tasks?: true
    last_activity?: true
    _all?: true
  }

  export type LearningProgressAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearningProgress to aggregate.
     */
    where?: LearningProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningProgresses to fetch.
     */
    orderBy?: LearningProgressOrderByWithRelationInput | LearningProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LearningProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LearningProgresses
    **/
    _count?: true | LearningProgressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LearningProgressAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LearningProgressSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LearningProgressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LearningProgressMaxAggregateInputType
  }

  export type GetLearningProgressAggregateType<T extends LearningProgressAggregateArgs> = {
        [P in keyof T & keyof AggregateLearningProgress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLearningProgress[P]>
      : GetScalarType<T[P], AggregateLearningProgress[P]>
  }




  export type LearningProgressGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningProgressWhereInput
    orderBy?: LearningProgressOrderByWithAggregationInput | LearningProgressOrderByWithAggregationInput[]
    by: LearningProgressScalarFieldEnum[] | LearningProgressScalarFieldEnum
    having?: LearningProgressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LearningProgressCountAggregateInputType | true
    _avg?: LearningProgressAvgAggregateInputType
    _sum?: LearningProgressSumAggregateInputType
    _min?: LearningProgressMinAggregateInputType
    _max?: LearningProgressMaxAggregateInputType
  }

  export type LearningProgressGroupByOutputType = {
    id: string
    learning_session_id: string
    category: string
    mastery_level: number
    tasks_completed: number
    total_tasks: number
    last_activity: Date
    _count: LearningProgressCountAggregateOutputType | null
    _avg: LearningProgressAvgAggregateOutputType | null
    _sum: LearningProgressSumAggregateOutputType | null
    _min: LearningProgressMinAggregateOutputType | null
    _max: LearningProgressMaxAggregateOutputType | null
  }

  type GetLearningProgressGroupByPayload<T extends LearningProgressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LearningProgressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LearningProgressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LearningProgressGroupByOutputType[P]>
            : GetScalarType<T[P], LearningProgressGroupByOutputType[P]>
        }
      >
    >


  export type LearningProgressSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    category?: boolean
    mastery_level?: boolean
    tasks_completed?: boolean
    total_tasks?: boolean
    last_activity?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningProgress"]>

  export type LearningProgressSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    category?: boolean
    mastery_level?: boolean
    tasks_completed?: boolean
    total_tasks?: boolean
    last_activity?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningProgress"]>

  export type LearningProgressSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    category?: boolean
    mastery_level?: boolean
    tasks_completed?: boolean
    total_tasks?: boolean
    last_activity?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningProgress"]>

  export type LearningProgressSelectScalar = {
    id?: boolean
    learning_session_id?: boolean
    category?: boolean
    mastery_level?: boolean
    tasks_completed?: boolean
    total_tasks?: boolean
    last_activity?: boolean
  }

  export type LearningProgressOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "learning_session_id" | "category" | "mastery_level" | "tasks_completed" | "total_tasks" | "last_activity", ExtArgs["result"]["learningProgress"]>
  export type LearningProgressInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }
  export type LearningProgressIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }
  export type LearningProgressIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }

  export type $LearningProgressPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LearningProgress"
    objects: {
      learning_session: Prisma.$LearningSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      learning_session_id: string
      category: string
      mastery_level: number
      tasks_completed: number
      total_tasks: number
      last_activity: Date
    }, ExtArgs["result"]["learningProgress"]>
    composites: {}
  }

  type LearningProgressGetPayload<S extends boolean | null | undefined | LearningProgressDefaultArgs> = $Result.GetResult<Prisma.$LearningProgressPayload, S>

  type LearningProgressCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LearningProgressFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LearningProgressCountAggregateInputType | true
    }

  export interface LearningProgressDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LearningProgress'], meta: { name: 'LearningProgress' } }
    /**
     * Find zero or one LearningProgress that matches the filter.
     * @param {LearningProgressFindUniqueArgs} args - Arguments to find a LearningProgress
     * @example
     * // Get one LearningProgress
     * const learningProgress = await prisma.learningProgress.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LearningProgressFindUniqueArgs>(args: SelectSubset<T, LearningProgressFindUniqueArgs<ExtArgs>>): Prisma__LearningProgressClient<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LearningProgress that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LearningProgressFindUniqueOrThrowArgs} args - Arguments to find a LearningProgress
     * @example
     * // Get one LearningProgress
     * const learningProgress = await prisma.learningProgress.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LearningProgressFindUniqueOrThrowArgs>(args: SelectSubset<T, LearningProgressFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LearningProgressClient<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearningProgress that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningProgressFindFirstArgs} args - Arguments to find a LearningProgress
     * @example
     * // Get one LearningProgress
     * const learningProgress = await prisma.learningProgress.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LearningProgressFindFirstArgs>(args?: SelectSubset<T, LearningProgressFindFirstArgs<ExtArgs>>): Prisma__LearningProgressClient<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearningProgress that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningProgressFindFirstOrThrowArgs} args - Arguments to find a LearningProgress
     * @example
     * // Get one LearningProgress
     * const learningProgress = await prisma.learningProgress.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LearningProgressFindFirstOrThrowArgs>(args?: SelectSubset<T, LearningProgressFindFirstOrThrowArgs<ExtArgs>>): Prisma__LearningProgressClient<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LearningProgresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningProgressFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LearningProgresses
     * const learningProgresses = await prisma.learningProgress.findMany()
     * 
     * // Get first 10 LearningProgresses
     * const learningProgresses = await prisma.learningProgress.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const learningProgressWithIdOnly = await prisma.learningProgress.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LearningProgressFindManyArgs>(args?: SelectSubset<T, LearningProgressFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LearningProgress.
     * @param {LearningProgressCreateArgs} args - Arguments to create a LearningProgress.
     * @example
     * // Create one LearningProgress
     * const LearningProgress = await prisma.learningProgress.create({
     *   data: {
     *     // ... data to create a LearningProgress
     *   }
     * })
     * 
     */
    create<T extends LearningProgressCreateArgs>(args: SelectSubset<T, LearningProgressCreateArgs<ExtArgs>>): Prisma__LearningProgressClient<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LearningProgresses.
     * @param {LearningProgressCreateManyArgs} args - Arguments to create many LearningProgresses.
     * @example
     * // Create many LearningProgresses
     * const learningProgress = await prisma.learningProgress.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LearningProgressCreateManyArgs>(args?: SelectSubset<T, LearningProgressCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LearningProgresses and returns the data saved in the database.
     * @param {LearningProgressCreateManyAndReturnArgs} args - Arguments to create many LearningProgresses.
     * @example
     * // Create many LearningProgresses
     * const learningProgress = await prisma.learningProgress.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LearningProgresses and only return the `id`
     * const learningProgressWithIdOnly = await prisma.learningProgress.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LearningProgressCreateManyAndReturnArgs>(args?: SelectSubset<T, LearningProgressCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LearningProgress.
     * @param {LearningProgressDeleteArgs} args - Arguments to delete one LearningProgress.
     * @example
     * // Delete one LearningProgress
     * const LearningProgress = await prisma.learningProgress.delete({
     *   where: {
     *     // ... filter to delete one LearningProgress
     *   }
     * })
     * 
     */
    delete<T extends LearningProgressDeleteArgs>(args: SelectSubset<T, LearningProgressDeleteArgs<ExtArgs>>): Prisma__LearningProgressClient<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LearningProgress.
     * @param {LearningProgressUpdateArgs} args - Arguments to update one LearningProgress.
     * @example
     * // Update one LearningProgress
     * const learningProgress = await prisma.learningProgress.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LearningProgressUpdateArgs>(args: SelectSubset<T, LearningProgressUpdateArgs<ExtArgs>>): Prisma__LearningProgressClient<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LearningProgresses.
     * @param {LearningProgressDeleteManyArgs} args - Arguments to filter LearningProgresses to delete.
     * @example
     * // Delete a few LearningProgresses
     * const { count } = await prisma.learningProgress.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LearningProgressDeleteManyArgs>(args?: SelectSubset<T, LearningProgressDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearningProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningProgressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LearningProgresses
     * const learningProgress = await prisma.learningProgress.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LearningProgressUpdateManyArgs>(args: SelectSubset<T, LearningProgressUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearningProgresses and returns the data updated in the database.
     * @param {LearningProgressUpdateManyAndReturnArgs} args - Arguments to update many LearningProgresses.
     * @example
     * // Update many LearningProgresses
     * const learningProgress = await prisma.learningProgress.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LearningProgresses and only return the `id`
     * const learningProgressWithIdOnly = await prisma.learningProgress.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LearningProgressUpdateManyAndReturnArgs>(args: SelectSubset<T, LearningProgressUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LearningProgress.
     * @param {LearningProgressUpsertArgs} args - Arguments to update or create a LearningProgress.
     * @example
     * // Update or create a LearningProgress
     * const learningProgress = await prisma.learningProgress.upsert({
     *   create: {
     *     // ... data to create a LearningProgress
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LearningProgress we want to update
     *   }
     * })
     */
    upsert<T extends LearningProgressUpsertArgs>(args: SelectSubset<T, LearningProgressUpsertArgs<ExtArgs>>): Prisma__LearningProgressClient<$Result.GetResult<Prisma.$LearningProgressPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LearningProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningProgressCountArgs} args - Arguments to filter LearningProgresses to count.
     * @example
     * // Count the number of LearningProgresses
     * const count = await prisma.learningProgress.count({
     *   where: {
     *     // ... the filter for the LearningProgresses we want to count
     *   }
     * })
    **/
    count<T extends LearningProgressCountArgs>(
      args?: Subset<T, LearningProgressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LearningProgressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LearningProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningProgressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LearningProgressAggregateArgs>(args: Subset<T, LearningProgressAggregateArgs>): Prisma.PrismaPromise<GetLearningProgressAggregateType<T>>

    /**
     * Group by LearningProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningProgressGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LearningProgressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LearningProgressGroupByArgs['orderBy'] }
        : { orderBy?: LearningProgressGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LearningProgressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLearningProgressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LearningProgress model
   */
  readonly fields: LearningProgressFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LearningProgress.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LearningProgressClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    learning_session<T extends LearningSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LearningSessionDefaultArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LearningProgress model
   */
  interface LearningProgressFieldRefs {
    readonly id: FieldRef<"LearningProgress", 'String'>
    readonly learning_session_id: FieldRef<"LearningProgress", 'String'>
    readonly category: FieldRef<"LearningProgress", 'String'>
    readonly mastery_level: FieldRef<"LearningProgress", 'Float'>
    readonly tasks_completed: FieldRef<"LearningProgress", 'Int'>
    readonly total_tasks: FieldRef<"LearningProgress", 'Int'>
    readonly last_activity: FieldRef<"LearningProgress", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LearningProgress findUnique
   */
  export type LearningProgressFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which LearningProgress to fetch.
     */
    where: LearningProgressWhereUniqueInput
  }

  /**
   * LearningProgress findUniqueOrThrow
   */
  export type LearningProgressFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which LearningProgress to fetch.
     */
    where: LearningProgressWhereUniqueInput
  }

  /**
   * LearningProgress findFirst
   */
  export type LearningProgressFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which LearningProgress to fetch.
     */
    where?: LearningProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningProgresses to fetch.
     */
    orderBy?: LearningProgressOrderByWithRelationInput | LearningProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearningProgresses.
     */
    cursor?: LearningProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearningProgresses.
     */
    distinct?: LearningProgressScalarFieldEnum | LearningProgressScalarFieldEnum[]
  }

  /**
   * LearningProgress findFirstOrThrow
   */
  export type LearningProgressFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which LearningProgress to fetch.
     */
    where?: LearningProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningProgresses to fetch.
     */
    orderBy?: LearningProgressOrderByWithRelationInput | LearningProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearningProgresses.
     */
    cursor?: LearningProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearningProgresses.
     */
    distinct?: LearningProgressScalarFieldEnum | LearningProgressScalarFieldEnum[]
  }

  /**
   * LearningProgress findMany
   */
  export type LearningProgressFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * Filter, which LearningProgresses to fetch.
     */
    where?: LearningProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningProgresses to fetch.
     */
    orderBy?: LearningProgressOrderByWithRelationInput | LearningProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LearningProgresses.
     */
    cursor?: LearningProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningProgresses.
     */
    skip?: number
    distinct?: LearningProgressScalarFieldEnum | LearningProgressScalarFieldEnum[]
  }

  /**
   * LearningProgress create
   */
  export type LearningProgressCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * The data needed to create a LearningProgress.
     */
    data: XOR<LearningProgressCreateInput, LearningProgressUncheckedCreateInput>
  }

  /**
   * LearningProgress createMany
   */
  export type LearningProgressCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LearningProgresses.
     */
    data: LearningProgressCreateManyInput | LearningProgressCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LearningProgress createManyAndReturn
   */
  export type LearningProgressCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * The data used to create many LearningProgresses.
     */
    data: LearningProgressCreateManyInput | LearningProgressCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearningProgress update
   */
  export type LearningProgressUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * The data needed to update a LearningProgress.
     */
    data: XOR<LearningProgressUpdateInput, LearningProgressUncheckedUpdateInput>
    /**
     * Choose, which LearningProgress to update.
     */
    where: LearningProgressWhereUniqueInput
  }

  /**
   * LearningProgress updateMany
   */
  export type LearningProgressUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LearningProgresses.
     */
    data: XOR<LearningProgressUpdateManyMutationInput, LearningProgressUncheckedUpdateManyInput>
    /**
     * Filter which LearningProgresses to update
     */
    where?: LearningProgressWhereInput
    /**
     * Limit how many LearningProgresses to update.
     */
    limit?: number
  }

  /**
   * LearningProgress updateManyAndReturn
   */
  export type LearningProgressUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * The data used to update LearningProgresses.
     */
    data: XOR<LearningProgressUpdateManyMutationInput, LearningProgressUncheckedUpdateManyInput>
    /**
     * Filter which LearningProgresses to update
     */
    where?: LearningProgressWhereInput
    /**
     * Limit how many LearningProgresses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearningProgress upsert
   */
  export type LearningProgressUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * The filter to search for the LearningProgress to update in case it exists.
     */
    where: LearningProgressWhereUniqueInput
    /**
     * In case the LearningProgress found by the `where` argument doesn't exist, create a new LearningProgress with this data.
     */
    create: XOR<LearningProgressCreateInput, LearningProgressUncheckedCreateInput>
    /**
     * In case the LearningProgress was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LearningProgressUpdateInput, LearningProgressUncheckedUpdateInput>
  }

  /**
   * LearningProgress delete
   */
  export type LearningProgressDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
    /**
     * Filter which LearningProgress to delete.
     */
    where: LearningProgressWhereUniqueInput
  }

  /**
   * LearningProgress deleteMany
   */
  export type LearningProgressDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearningProgresses to delete
     */
    where?: LearningProgressWhereInput
    /**
     * Limit how many LearningProgresses to delete.
     */
    limit?: number
  }

  /**
   * LearningProgress without action
   */
  export type LearningProgressDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningProgress
     */
    select?: LearningProgressSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningProgress
     */
    omit?: LearningProgressOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningProgressInclude<ExtArgs> | null
  }


  /**
   * Model LearningChatMessage
   */

  export type AggregateLearningChatMessage = {
    _count: LearningChatMessageCountAggregateOutputType | null
    _min: LearningChatMessageMinAggregateOutputType | null
    _max: LearningChatMessageMaxAggregateOutputType | null
  }

  export type LearningChatMessageMinAggregateOutputType = {
    id: string | null
    learning_session_id: string | null
    role: string | null
    content: string | null
    message_type: string | null
    created_at: Date | null
  }

  export type LearningChatMessageMaxAggregateOutputType = {
    id: string | null
    learning_session_id: string | null
    role: string | null
    content: string | null
    message_type: string | null
    created_at: Date | null
  }

  export type LearningChatMessageCountAggregateOutputType = {
    id: number
    learning_session_id: number
    role: number
    content: number
    message_type: number
    created_at: number
    _all: number
  }


  export type LearningChatMessageMinAggregateInputType = {
    id?: true
    learning_session_id?: true
    role?: true
    content?: true
    message_type?: true
    created_at?: true
  }

  export type LearningChatMessageMaxAggregateInputType = {
    id?: true
    learning_session_id?: true
    role?: true
    content?: true
    message_type?: true
    created_at?: true
  }

  export type LearningChatMessageCountAggregateInputType = {
    id?: true
    learning_session_id?: true
    role?: true
    content?: true
    message_type?: true
    created_at?: true
    _all?: true
  }

  export type LearningChatMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearningChatMessage to aggregate.
     */
    where?: LearningChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningChatMessages to fetch.
     */
    orderBy?: LearningChatMessageOrderByWithRelationInput | LearningChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LearningChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LearningChatMessages
    **/
    _count?: true | LearningChatMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LearningChatMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LearningChatMessageMaxAggregateInputType
  }

  export type GetLearningChatMessageAggregateType<T extends LearningChatMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateLearningChatMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLearningChatMessage[P]>
      : GetScalarType<T[P], AggregateLearningChatMessage[P]>
  }




  export type LearningChatMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LearningChatMessageWhereInput
    orderBy?: LearningChatMessageOrderByWithAggregationInput | LearningChatMessageOrderByWithAggregationInput[]
    by: LearningChatMessageScalarFieldEnum[] | LearningChatMessageScalarFieldEnum
    having?: LearningChatMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LearningChatMessageCountAggregateInputType | true
    _min?: LearningChatMessageMinAggregateInputType
    _max?: LearningChatMessageMaxAggregateInputType
  }

  export type LearningChatMessageGroupByOutputType = {
    id: string
    learning_session_id: string
    role: string
    content: string
    message_type: string
    created_at: Date
    _count: LearningChatMessageCountAggregateOutputType | null
    _min: LearningChatMessageMinAggregateOutputType | null
    _max: LearningChatMessageMaxAggregateOutputType | null
  }

  type GetLearningChatMessageGroupByPayload<T extends LearningChatMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LearningChatMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LearningChatMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LearningChatMessageGroupByOutputType[P]>
            : GetScalarType<T[P], LearningChatMessageGroupByOutputType[P]>
        }
      >
    >


  export type LearningChatMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    role?: boolean
    content?: boolean
    message_type?: boolean
    created_at?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningChatMessage"]>

  export type LearningChatMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    role?: boolean
    content?: boolean
    message_type?: boolean
    created_at?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningChatMessage"]>

  export type LearningChatMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    learning_session_id?: boolean
    role?: boolean
    content?: boolean
    message_type?: boolean
    created_at?: boolean
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["learningChatMessage"]>

  export type LearningChatMessageSelectScalar = {
    id?: boolean
    learning_session_id?: boolean
    role?: boolean
    content?: boolean
    message_type?: boolean
    created_at?: boolean
  }

  export type LearningChatMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "learning_session_id" | "role" | "content" | "message_type" | "created_at", ExtArgs["result"]["learningChatMessage"]>
  export type LearningChatMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }
  export type LearningChatMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }
  export type LearningChatMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    learning_session?: boolean | LearningSessionDefaultArgs<ExtArgs>
  }

  export type $LearningChatMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LearningChatMessage"
    objects: {
      learning_session: Prisma.$LearningSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      learning_session_id: string
      role: string
      content: string
      message_type: string
      created_at: Date
    }, ExtArgs["result"]["learningChatMessage"]>
    composites: {}
  }

  type LearningChatMessageGetPayload<S extends boolean | null | undefined | LearningChatMessageDefaultArgs> = $Result.GetResult<Prisma.$LearningChatMessagePayload, S>

  type LearningChatMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LearningChatMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LearningChatMessageCountAggregateInputType | true
    }

  export interface LearningChatMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LearningChatMessage'], meta: { name: 'LearningChatMessage' } }
    /**
     * Find zero or one LearningChatMessage that matches the filter.
     * @param {LearningChatMessageFindUniqueArgs} args - Arguments to find a LearningChatMessage
     * @example
     * // Get one LearningChatMessage
     * const learningChatMessage = await prisma.learningChatMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LearningChatMessageFindUniqueArgs>(args: SelectSubset<T, LearningChatMessageFindUniqueArgs<ExtArgs>>): Prisma__LearningChatMessageClient<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LearningChatMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LearningChatMessageFindUniqueOrThrowArgs} args - Arguments to find a LearningChatMessage
     * @example
     * // Get one LearningChatMessage
     * const learningChatMessage = await prisma.learningChatMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LearningChatMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, LearningChatMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LearningChatMessageClient<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearningChatMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningChatMessageFindFirstArgs} args - Arguments to find a LearningChatMessage
     * @example
     * // Get one LearningChatMessage
     * const learningChatMessage = await prisma.learningChatMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LearningChatMessageFindFirstArgs>(args?: SelectSubset<T, LearningChatMessageFindFirstArgs<ExtArgs>>): Prisma__LearningChatMessageClient<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LearningChatMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningChatMessageFindFirstOrThrowArgs} args - Arguments to find a LearningChatMessage
     * @example
     * // Get one LearningChatMessage
     * const learningChatMessage = await prisma.learningChatMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LearningChatMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, LearningChatMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__LearningChatMessageClient<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LearningChatMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningChatMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LearningChatMessages
     * const learningChatMessages = await prisma.learningChatMessage.findMany()
     * 
     * // Get first 10 LearningChatMessages
     * const learningChatMessages = await prisma.learningChatMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const learningChatMessageWithIdOnly = await prisma.learningChatMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LearningChatMessageFindManyArgs>(args?: SelectSubset<T, LearningChatMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LearningChatMessage.
     * @param {LearningChatMessageCreateArgs} args - Arguments to create a LearningChatMessage.
     * @example
     * // Create one LearningChatMessage
     * const LearningChatMessage = await prisma.learningChatMessage.create({
     *   data: {
     *     // ... data to create a LearningChatMessage
     *   }
     * })
     * 
     */
    create<T extends LearningChatMessageCreateArgs>(args: SelectSubset<T, LearningChatMessageCreateArgs<ExtArgs>>): Prisma__LearningChatMessageClient<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LearningChatMessages.
     * @param {LearningChatMessageCreateManyArgs} args - Arguments to create many LearningChatMessages.
     * @example
     * // Create many LearningChatMessages
     * const learningChatMessage = await prisma.learningChatMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LearningChatMessageCreateManyArgs>(args?: SelectSubset<T, LearningChatMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LearningChatMessages and returns the data saved in the database.
     * @param {LearningChatMessageCreateManyAndReturnArgs} args - Arguments to create many LearningChatMessages.
     * @example
     * // Create many LearningChatMessages
     * const learningChatMessage = await prisma.learningChatMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LearningChatMessages and only return the `id`
     * const learningChatMessageWithIdOnly = await prisma.learningChatMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LearningChatMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, LearningChatMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LearningChatMessage.
     * @param {LearningChatMessageDeleteArgs} args - Arguments to delete one LearningChatMessage.
     * @example
     * // Delete one LearningChatMessage
     * const LearningChatMessage = await prisma.learningChatMessage.delete({
     *   where: {
     *     // ... filter to delete one LearningChatMessage
     *   }
     * })
     * 
     */
    delete<T extends LearningChatMessageDeleteArgs>(args: SelectSubset<T, LearningChatMessageDeleteArgs<ExtArgs>>): Prisma__LearningChatMessageClient<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LearningChatMessage.
     * @param {LearningChatMessageUpdateArgs} args - Arguments to update one LearningChatMessage.
     * @example
     * // Update one LearningChatMessage
     * const learningChatMessage = await prisma.learningChatMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LearningChatMessageUpdateArgs>(args: SelectSubset<T, LearningChatMessageUpdateArgs<ExtArgs>>): Prisma__LearningChatMessageClient<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LearningChatMessages.
     * @param {LearningChatMessageDeleteManyArgs} args - Arguments to filter LearningChatMessages to delete.
     * @example
     * // Delete a few LearningChatMessages
     * const { count } = await prisma.learningChatMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LearningChatMessageDeleteManyArgs>(args?: SelectSubset<T, LearningChatMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearningChatMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningChatMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LearningChatMessages
     * const learningChatMessage = await prisma.learningChatMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LearningChatMessageUpdateManyArgs>(args: SelectSubset<T, LearningChatMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LearningChatMessages and returns the data updated in the database.
     * @param {LearningChatMessageUpdateManyAndReturnArgs} args - Arguments to update many LearningChatMessages.
     * @example
     * // Update many LearningChatMessages
     * const learningChatMessage = await prisma.learningChatMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LearningChatMessages and only return the `id`
     * const learningChatMessageWithIdOnly = await prisma.learningChatMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LearningChatMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, LearningChatMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LearningChatMessage.
     * @param {LearningChatMessageUpsertArgs} args - Arguments to update or create a LearningChatMessage.
     * @example
     * // Update or create a LearningChatMessage
     * const learningChatMessage = await prisma.learningChatMessage.upsert({
     *   create: {
     *     // ... data to create a LearningChatMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LearningChatMessage we want to update
     *   }
     * })
     */
    upsert<T extends LearningChatMessageUpsertArgs>(args: SelectSubset<T, LearningChatMessageUpsertArgs<ExtArgs>>): Prisma__LearningChatMessageClient<$Result.GetResult<Prisma.$LearningChatMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LearningChatMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningChatMessageCountArgs} args - Arguments to filter LearningChatMessages to count.
     * @example
     * // Count the number of LearningChatMessages
     * const count = await prisma.learningChatMessage.count({
     *   where: {
     *     // ... the filter for the LearningChatMessages we want to count
     *   }
     * })
    **/
    count<T extends LearningChatMessageCountArgs>(
      args?: Subset<T, LearningChatMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LearningChatMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LearningChatMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningChatMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LearningChatMessageAggregateArgs>(args: Subset<T, LearningChatMessageAggregateArgs>): Prisma.PrismaPromise<GetLearningChatMessageAggregateType<T>>

    /**
     * Group by LearningChatMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LearningChatMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LearningChatMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LearningChatMessageGroupByArgs['orderBy'] }
        : { orderBy?: LearningChatMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LearningChatMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLearningChatMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LearningChatMessage model
   */
  readonly fields: LearningChatMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LearningChatMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LearningChatMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    learning_session<T extends LearningSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LearningSessionDefaultArgs<ExtArgs>>): Prisma__LearningSessionClient<$Result.GetResult<Prisma.$LearningSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LearningChatMessage model
   */
  interface LearningChatMessageFieldRefs {
    readonly id: FieldRef<"LearningChatMessage", 'String'>
    readonly learning_session_id: FieldRef<"LearningChatMessage", 'String'>
    readonly role: FieldRef<"LearningChatMessage", 'String'>
    readonly content: FieldRef<"LearningChatMessage", 'String'>
    readonly message_type: FieldRef<"LearningChatMessage", 'String'>
    readonly created_at: FieldRef<"LearningChatMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LearningChatMessage findUnique
   */
  export type LearningChatMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which LearningChatMessage to fetch.
     */
    where: LearningChatMessageWhereUniqueInput
  }

  /**
   * LearningChatMessage findUniqueOrThrow
   */
  export type LearningChatMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which LearningChatMessage to fetch.
     */
    where: LearningChatMessageWhereUniqueInput
  }

  /**
   * LearningChatMessage findFirst
   */
  export type LearningChatMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which LearningChatMessage to fetch.
     */
    where?: LearningChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningChatMessages to fetch.
     */
    orderBy?: LearningChatMessageOrderByWithRelationInput | LearningChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearningChatMessages.
     */
    cursor?: LearningChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearningChatMessages.
     */
    distinct?: LearningChatMessageScalarFieldEnum | LearningChatMessageScalarFieldEnum[]
  }

  /**
   * LearningChatMessage findFirstOrThrow
   */
  export type LearningChatMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which LearningChatMessage to fetch.
     */
    where?: LearningChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningChatMessages to fetch.
     */
    orderBy?: LearningChatMessageOrderByWithRelationInput | LearningChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LearningChatMessages.
     */
    cursor?: LearningChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LearningChatMessages.
     */
    distinct?: LearningChatMessageScalarFieldEnum | LearningChatMessageScalarFieldEnum[]
  }

  /**
   * LearningChatMessage findMany
   */
  export type LearningChatMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which LearningChatMessages to fetch.
     */
    where?: LearningChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LearningChatMessages to fetch.
     */
    orderBy?: LearningChatMessageOrderByWithRelationInput | LearningChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LearningChatMessages.
     */
    cursor?: LearningChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LearningChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LearningChatMessages.
     */
    skip?: number
    distinct?: LearningChatMessageScalarFieldEnum | LearningChatMessageScalarFieldEnum[]
  }

  /**
   * LearningChatMessage create
   */
  export type LearningChatMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a LearningChatMessage.
     */
    data: XOR<LearningChatMessageCreateInput, LearningChatMessageUncheckedCreateInput>
  }

  /**
   * LearningChatMessage createMany
   */
  export type LearningChatMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LearningChatMessages.
     */
    data: LearningChatMessageCreateManyInput | LearningChatMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LearningChatMessage createManyAndReturn
   */
  export type LearningChatMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * The data used to create many LearningChatMessages.
     */
    data: LearningChatMessageCreateManyInput | LearningChatMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearningChatMessage update
   */
  export type LearningChatMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a LearningChatMessage.
     */
    data: XOR<LearningChatMessageUpdateInput, LearningChatMessageUncheckedUpdateInput>
    /**
     * Choose, which LearningChatMessage to update.
     */
    where: LearningChatMessageWhereUniqueInput
  }

  /**
   * LearningChatMessage updateMany
   */
  export type LearningChatMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LearningChatMessages.
     */
    data: XOR<LearningChatMessageUpdateManyMutationInput, LearningChatMessageUncheckedUpdateManyInput>
    /**
     * Filter which LearningChatMessages to update
     */
    where?: LearningChatMessageWhereInput
    /**
     * Limit how many LearningChatMessages to update.
     */
    limit?: number
  }

  /**
   * LearningChatMessage updateManyAndReturn
   */
  export type LearningChatMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * The data used to update LearningChatMessages.
     */
    data: XOR<LearningChatMessageUpdateManyMutationInput, LearningChatMessageUncheckedUpdateManyInput>
    /**
     * Filter which LearningChatMessages to update
     */
    where?: LearningChatMessageWhereInput
    /**
     * Limit how many LearningChatMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LearningChatMessage upsert
   */
  export type LearningChatMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the LearningChatMessage to update in case it exists.
     */
    where: LearningChatMessageWhereUniqueInput
    /**
     * In case the LearningChatMessage found by the `where` argument doesn't exist, create a new LearningChatMessage with this data.
     */
    create: XOR<LearningChatMessageCreateInput, LearningChatMessageUncheckedCreateInput>
    /**
     * In case the LearningChatMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LearningChatMessageUpdateInput, LearningChatMessageUncheckedUpdateInput>
  }

  /**
   * LearningChatMessage delete
   */
  export type LearningChatMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
    /**
     * Filter which LearningChatMessage to delete.
     */
    where: LearningChatMessageWhereUniqueInput
  }

  /**
   * LearningChatMessage deleteMany
   */
  export type LearningChatMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LearningChatMessages to delete
     */
    where?: LearningChatMessageWhereInput
    /**
     * Limit how many LearningChatMessages to delete.
     */
    limit?: number
  }

  /**
   * LearningChatMessage without action
   */
  export type LearningChatMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LearningChatMessage
     */
    select?: LearningChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LearningChatMessage
     */
    omit?: LearningChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LearningChatMessageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    name: 'name',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ClientScalarFieldEnum: {
    id: 'id',
    name: 'name',
    company: 'company',
    email: 'email',
    user_id: 'user_id',
    created_at: 'created_at',
    updated_at: 'updated_at',
    scraped_content: 'scraped_content',
    scraped_pages: 'scraped_pages',
    scraped_chars: 'scraped_chars',
    scraped_words: 'scraped_words',
    scraped_at: 'scraped_at',
    scraped_url: 'scraped_url'
  };

  export type ClientScalarFieldEnum = (typeof ClientScalarFieldEnum)[keyof typeof ClientScalarFieldEnum]


  export const ProjectScalarFieldEnum: {
    id: 'id',
    client_id: 'client_id',
    title: 'title',
    description: 'description',
    documentation_urls: 'documentation_urls',
    prompt: 'prompt',
    status: 'status',
    script: 'script',
    user_id: 'user_id',
    created_at: 'created_at',
    updated_at: 'updated_at',
    scraped_content: 'scraped_content',
    scraped_pages: 'scraped_pages',
    scraped_chars: 'scraped_chars',
    scraped_words: 'scraped_words',
    scraped_at: 'scraped_at',
    scraped_url: 'scraped_url',
    video_type: 'video_type'
  };

  export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum]


  export const LearningSessionScalarFieldEnum: {
    id: 'id',
    client_id: 'client_id',
    user_id: 'user_id',
    software_name: 'software_name',
    documentation_summary: 'documentation_summary',
    current_phase: 'current_phase',
    completion_percentage: 'completion_percentage',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type LearningSessionScalarFieldEnum = (typeof LearningSessionScalarFieldEnum)[keyof typeof LearningSessionScalarFieldEnum]


  export const LearningTaskScalarFieldEnum: {
    id: 'id',
    learning_session_id: 'learning_session_id',
    title: 'title',
    description: 'description',
    instructions: 'instructions',
    category: 'category',
    difficulty_level: 'difficulty_level',
    estimated_minutes: 'estimated_minutes',
    prerequisites: 'prerequisites',
    is_completed: 'is_completed',
    completed_at: 'completed_at',
    user_notes: 'user_notes',
    created_at: 'created_at'
  };

  export type LearningTaskScalarFieldEnum = (typeof LearningTaskScalarFieldEnum)[keyof typeof LearningTaskScalarFieldEnum]


  export const LearningProgressScalarFieldEnum: {
    id: 'id',
    learning_session_id: 'learning_session_id',
    category: 'category',
    mastery_level: 'mastery_level',
    tasks_completed: 'tasks_completed',
    total_tasks: 'total_tasks',
    last_activity: 'last_activity'
  };

  export type LearningProgressScalarFieldEnum = (typeof LearningProgressScalarFieldEnum)[keyof typeof LearningProgressScalarFieldEnum]


  export const LearningChatMessageScalarFieldEnum: {
    id: 'id',
    learning_session_id: 'learning_session_id',
    role: 'role',
    content: 'content',
    message_type: 'message_type',
    created_at: 'created_at'
  };

  export type LearningChatMessageScalarFieldEnum = (typeof LearningChatMessageScalarFieldEnum)[keyof typeof LearningChatMessageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    clients?: ClientListRelationFilter
    projects?: ProjectListRelationFilter
    learning_sessions?: LearningSessionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    clients?: ClientOrderByRelationAggregateInput
    projects?: ProjectOrderByRelationAggregateInput
    learning_sessions?: LearningSessionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    clients?: ClientListRelationFilter
    projects?: ProjectListRelationFilter
    learning_sessions?: LearningSessionListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ClientWhereInput = {
    AND?: ClientWhereInput | ClientWhereInput[]
    OR?: ClientWhereInput[]
    NOT?: ClientWhereInput | ClientWhereInput[]
    id?: StringFilter<"Client"> | string
    name?: StringFilter<"Client"> | string
    company?: StringFilter<"Client"> | string
    email?: StringNullableFilter<"Client"> | string | null
    user_id?: StringFilter<"Client"> | string
    created_at?: DateTimeFilter<"Client"> | Date | string
    updated_at?: DateTimeFilter<"Client"> | Date | string
    scraped_content?: StringNullableFilter<"Client"> | string | null
    scraped_pages?: IntNullableFilter<"Client"> | number | null
    scraped_chars?: IntNullableFilter<"Client"> | number | null
    scraped_words?: IntNullableFilter<"Client"> | number | null
    scraped_at?: DateTimeNullableFilter<"Client"> | Date | string | null
    scraped_url?: StringNullableFilter<"Client"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    projects?: ProjectListRelationFilter
    learning_sessions?: LearningSessionListRelationFilter
  }

  export type ClientOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    company?: SortOrder
    email?: SortOrderInput | SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrderInput | SortOrder
    scraped_pages?: SortOrderInput | SortOrder
    scraped_chars?: SortOrderInput | SortOrder
    scraped_words?: SortOrderInput | SortOrder
    scraped_at?: SortOrderInput | SortOrder
    scraped_url?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    projects?: ProjectOrderByRelationAggregateInput
    learning_sessions?: LearningSessionOrderByRelationAggregateInput
  }

  export type ClientWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClientWhereInput | ClientWhereInput[]
    OR?: ClientWhereInput[]
    NOT?: ClientWhereInput | ClientWhereInput[]
    name?: StringFilter<"Client"> | string
    company?: StringFilter<"Client"> | string
    email?: StringNullableFilter<"Client"> | string | null
    user_id?: StringFilter<"Client"> | string
    created_at?: DateTimeFilter<"Client"> | Date | string
    updated_at?: DateTimeFilter<"Client"> | Date | string
    scraped_content?: StringNullableFilter<"Client"> | string | null
    scraped_pages?: IntNullableFilter<"Client"> | number | null
    scraped_chars?: IntNullableFilter<"Client"> | number | null
    scraped_words?: IntNullableFilter<"Client"> | number | null
    scraped_at?: DateTimeNullableFilter<"Client"> | Date | string | null
    scraped_url?: StringNullableFilter<"Client"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    projects?: ProjectListRelationFilter
    learning_sessions?: LearningSessionListRelationFilter
  }, "id">

  export type ClientOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    company?: SortOrder
    email?: SortOrderInput | SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrderInput | SortOrder
    scraped_pages?: SortOrderInput | SortOrder
    scraped_chars?: SortOrderInput | SortOrder
    scraped_words?: SortOrderInput | SortOrder
    scraped_at?: SortOrderInput | SortOrder
    scraped_url?: SortOrderInput | SortOrder
    _count?: ClientCountOrderByAggregateInput
    _avg?: ClientAvgOrderByAggregateInput
    _max?: ClientMaxOrderByAggregateInput
    _min?: ClientMinOrderByAggregateInput
    _sum?: ClientSumOrderByAggregateInput
  }

  export type ClientScalarWhereWithAggregatesInput = {
    AND?: ClientScalarWhereWithAggregatesInput | ClientScalarWhereWithAggregatesInput[]
    OR?: ClientScalarWhereWithAggregatesInput[]
    NOT?: ClientScalarWhereWithAggregatesInput | ClientScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Client"> | string
    name?: StringWithAggregatesFilter<"Client"> | string
    company?: StringWithAggregatesFilter<"Client"> | string
    email?: StringNullableWithAggregatesFilter<"Client"> | string | null
    user_id?: StringWithAggregatesFilter<"Client"> | string
    created_at?: DateTimeWithAggregatesFilter<"Client"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Client"> | Date | string
    scraped_content?: StringNullableWithAggregatesFilter<"Client"> | string | null
    scraped_pages?: IntNullableWithAggregatesFilter<"Client"> | number | null
    scraped_chars?: IntNullableWithAggregatesFilter<"Client"> | number | null
    scraped_words?: IntNullableWithAggregatesFilter<"Client"> | number | null
    scraped_at?: DateTimeNullableWithAggregatesFilter<"Client"> | Date | string | null
    scraped_url?: StringNullableWithAggregatesFilter<"Client"> | string | null
  }

  export type ProjectWhereInput = {
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    id?: StringFilter<"Project"> | string
    client_id?: StringFilter<"Project"> | string
    title?: StringFilter<"Project"> | string
    description?: StringFilter<"Project"> | string
    documentation_urls?: StringNullableListFilter<"Project">
    prompt?: StringFilter<"Project"> | string
    status?: StringFilter<"Project"> | string
    script?: StringNullableFilter<"Project"> | string | null
    user_id?: StringFilter<"Project"> | string
    created_at?: DateTimeFilter<"Project"> | Date | string
    updated_at?: DateTimeFilter<"Project"> | Date | string
    scraped_content?: StringNullableFilter<"Project"> | string | null
    scraped_pages?: IntNullableFilter<"Project"> | number | null
    scraped_chars?: IntNullableFilter<"Project"> | number | null
    scraped_words?: IntNullableFilter<"Project"> | number | null
    scraped_at?: DateTimeNullableFilter<"Project"> | Date | string | null
    scraped_url?: StringNullableFilter<"Project"> | string | null
    video_type?: StringNullableFilter<"Project"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
  }

  export type ProjectOrderByWithRelationInput = {
    id?: SortOrder
    client_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    documentation_urls?: SortOrder
    prompt?: SortOrder
    status?: SortOrder
    script?: SortOrderInput | SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrderInput | SortOrder
    scraped_pages?: SortOrderInput | SortOrder
    scraped_chars?: SortOrderInput | SortOrder
    scraped_words?: SortOrderInput | SortOrder
    scraped_at?: SortOrderInput | SortOrder
    scraped_url?: SortOrderInput | SortOrder
    video_type?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    client?: ClientOrderByWithRelationInput
  }

  export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    client_id?: StringFilter<"Project"> | string
    title?: StringFilter<"Project"> | string
    description?: StringFilter<"Project"> | string
    documentation_urls?: StringNullableListFilter<"Project">
    prompt?: StringFilter<"Project"> | string
    status?: StringFilter<"Project"> | string
    script?: StringNullableFilter<"Project"> | string | null
    user_id?: StringFilter<"Project"> | string
    created_at?: DateTimeFilter<"Project"> | Date | string
    updated_at?: DateTimeFilter<"Project"> | Date | string
    scraped_content?: StringNullableFilter<"Project"> | string | null
    scraped_pages?: IntNullableFilter<"Project"> | number | null
    scraped_chars?: IntNullableFilter<"Project"> | number | null
    scraped_words?: IntNullableFilter<"Project"> | number | null
    scraped_at?: DateTimeNullableFilter<"Project"> | Date | string | null
    scraped_url?: StringNullableFilter<"Project"> | string | null
    video_type?: StringNullableFilter<"Project"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
  }, "id">

  export type ProjectOrderByWithAggregationInput = {
    id?: SortOrder
    client_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    documentation_urls?: SortOrder
    prompt?: SortOrder
    status?: SortOrder
    script?: SortOrderInput | SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrderInput | SortOrder
    scraped_pages?: SortOrderInput | SortOrder
    scraped_chars?: SortOrderInput | SortOrder
    scraped_words?: SortOrderInput | SortOrder
    scraped_at?: SortOrderInput | SortOrder
    scraped_url?: SortOrderInput | SortOrder
    video_type?: SortOrderInput | SortOrder
    _count?: ProjectCountOrderByAggregateInput
    _avg?: ProjectAvgOrderByAggregateInput
    _max?: ProjectMaxOrderByAggregateInput
    _min?: ProjectMinOrderByAggregateInput
    _sum?: ProjectSumOrderByAggregateInput
  }

  export type ProjectScalarWhereWithAggregatesInput = {
    AND?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    OR?: ProjectScalarWhereWithAggregatesInput[]
    NOT?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Project"> | string
    client_id?: StringWithAggregatesFilter<"Project"> | string
    title?: StringWithAggregatesFilter<"Project"> | string
    description?: StringWithAggregatesFilter<"Project"> | string
    documentation_urls?: StringNullableListFilter<"Project">
    prompt?: StringWithAggregatesFilter<"Project"> | string
    status?: StringWithAggregatesFilter<"Project"> | string
    script?: StringNullableWithAggregatesFilter<"Project"> | string | null
    user_id?: StringWithAggregatesFilter<"Project"> | string
    created_at?: DateTimeWithAggregatesFilter<"Project"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Project"> | Date | string
    scraped_content?: StringNullableWithAggregatesFilter<"Project"> | string | null
    scraped_pages?: IntNullableWithAggregatesFilter<"Project"> | number | null
    scraped_chars?: IntNullableWithAggregatesFilter<"Project"> | number | null
    scraped_words?: IntNullableWithAggregatesFilter<"Project"> | number | null
    scraped_at?: DateTimeNullableWithAggregatesFilter<"Project"> | Date | string | null
    scraped_url?: StringNullableWithAggregatesFilter<"Project"> | string | null
    video_type?: StringNullableWithAggregatesFilter<"Project"> | string | null
  }

  export type LearningSessionWhereInput = {
    AND?: LearningSessionWhereInput | LearningSessionWhereInput[]
    OR?: LearningSessionWhereInput[]
    NOT?: LearningSessionWhereInput | LearningSessionWhereInput[]
    id?: StringFilter<"LearningSession"> | string
    client_id?: StringFilter<"LearningSession"> | string
    user_id?: StringFilter<"LearningSession"> | string
    software_name?: StringFilter<"LearningSession"> | string
    documentation_summary?: StringNullableFilter<"LearningSession"> | string | null
    current_phase?: StringFilter<"LearningSession"> | string
    completion_percentage?: FloatFilter<"LearningSession"> | number
    created_at?: DateTimeFilter<"LearningSession"> | Date | string
    updated_at?: DateTimeFilter<"LearningSession"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    tasks?: LearningTaskListRelationFilter
    progress?: LearningProgressListRelationFilter
    chat_messages?: LearningChatMessageListRelationFilter
  }

  export type LearningSessionOrderByWithRelationInput = {
    id?: SortOrder
    client_id?: SortOrder
    user_id?: SortOrder
    software_name?: SortOrder
    documentation_summary?: SortOrderInput | SortOrder
    current_phase?: SortOrder
    completion_percentage?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
    client?: ClientOrderByWithRelationInput
    tasks?: LearningTaskOrderByRelationAggregateInput
    progress?: LearningProgressOrderByRelationAggregateInput
    chat_messages?: LearningChatMessageOrderByRelationAggregateInput
  }

  export type LearningSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LearningSessionWhereInput | LearningSessionWhereInput[]
    OR?: LearningSessionWhereInput[]
    NOT?: LearningSessionWhereInput | LearningSessionWhereInput[]
    client_id?: StringFilter<"LearningSession"> | string
    user_id?: StringFilter<"LearningSession"> | string
    software_name?: StringFilter<"LearningSession"> | string
    documentation_summary?: StringNullableFilter<"LearningSession"> | string | null
    current_phase?: StringFilter<"LearningSession"> | string
    completion_percentage?: FloatFilter<"LearningSession"> | number
    created_at?: DateTimeFilter<"LearningSession"> | Date | string
    updated_at?: DateTimeFilter<"LearningSession"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    tasks?: LearningTaskListRelationFilter
    progress?: LearningProgressListRelationFilter
    chat_messages?: LearningChatMessageListRelationFilter
  }, "id">

  export type LearningSessionOrderByWithAggregationInput = {
    id?: SortOrder
    client_id?: SortOrder
    user_id?: SortOrder
    software_name?: SortOrder
    documentation_summary?: SortOrderInput | SortOrder
    current_phase?: SortOrder
    completion_percentage?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: LearningSessionCountOrderByAggregateInput
    _avg?: LearningSessionAvgOrderByAggregateInput
    _max?: LearningSessionMaxOrderByAggregateInput
    _min?: LearningSessionMinOrderByAggregateInput
    _sum?: LearningSessionSumOrderByAggregateInput
  }

  export type LearningSessionScalarWhereWithAggregatesInput = {
    AND?: LearningSessionScalarWhereWithAggregatesInput | LearningSessionScalarWhereWithAggregatesInput[]
    OR?: LearningSessionScalarWhereWithAggregatesInput[]
    NOT?: LearningSessionScalarWhereWithAggregatesInput | LearningSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LearningSession"> | string
    client_id?: StringWithAggregatesFilter<"LearningSession"> | string
    user_id?: StringWithAggregatesFilter<"LearningSession"> | string
    software_name?: StringWithAggregatesFilter<"LearningSession"> | string
    documentation_summary?: StringNullableWithAggregatesFilter<"LearningSession"> | string | null
    current_phase?: StringWithAggregatesFilter<"LearningSession"> | string
    completion_percentage?: FloatWithAggregatesFilter<"LearningSession"> | number
    created_at?: DateTimeWithAggregatesFilter<"LearningSession"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"LearningSession"> | Date | string
  }

  export type LearningTaskWhereInput = {
    AND?: LearningTaskWhereInput | LearningTaskWhereInput[]
    OR?: LearningTaskWhereInput[]
    NOT?: LearningTaskWhereInput | LearningTaskWhereInput[]
    id?: StringFilter<"LearningTask"> | string
    learning_session_id?: StringFilter<"LearningTask"> | string
    title?: StringFilter<"LearningTask"> | string
    description?: StringFilter<"LearningTask"> | string
    instructions?: StringFilter<"LearningTask"> | string
    category?: StringFilter<"LearningTask"> | string
    difficulty_level?: IntFilter<"LearningTask"> | number
    estimated_minutes?: IntNullableFilter<"LearningTask"> | number | null
    prerequisites?: StringNullableListFilter<"LearningTask">
    is_completed?: BoolFilter<"LearningTask"> | boolean
    completed_at?: DateTimeNullableFilter<"LearningTask"> | Date | string | null
    user_notes?: StringNullableFilter<"LearningTask"> | string | null
    created_at?: DateTimeFilter<"LearningTask"> | Date | string
    learning_session?: XOR<LearningSessionScalarRelationFilter, LearningSessionWhereInput>
  }

  export type LearningTaskOrderByWithRelationInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    instructions?: SortOrder
    category?: SortOrder
    difficulty_level?: SortOrder
    estimated_minutes?: SortOrderInput | SortOrder
    prerequisites?: SortOrder
    is_completed?: SortOrder
    completed_at?: SortOrderInput | SortOrder
    user_notes?: SortOrderInput | SortOrder
    created_at?: SortOrder
    learning_session?: LearningSessionOrderByWithRelationInput
  }

  export type LearningTaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LearningTaskWhereInput | LearningTaskWhereInput[]
    OR?: LearningTaskWhereInput[]
    NOT?: LearningTaskWhereInput | LearningTaskWhereInput[]
    learning_session_id?: StringFilter<"LearningTask"> | string
    title?: StringFilter<"LearningTask"> | string
    description?: StringFilter<"LearningTask"> | string
    instructions?: StringFilter<"LearningTask"> | string
    category?: StringFilter<"LearningTask"> | string
    difficulty_level?: IntFilter<"LearningTask"> | number
    estimated_minutes?: IntNullableFilter<"LearningTask"> | number | null
    prerequisites?: StringNullableListFilter<"LearningTask">
    is_completed?: BoolFilter<"LearningTask"> | boolean
    completed_at?: DateTimeNullableFilter<"LearningTask"> | Date | string | null
    user_notes?: StringNullableFilter<"LearningTask"> | string | null
    created_at?: DateTimeFilter<"LearningTask"> | Date | string
    learning_session?: XOR<LearningSessionScalarRelationFilter, LearningSessionWhereInput>
  }, "id">

  export type LearningTaskOrderByWithAggregationInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    instructions?: SortOrder
    category?: SortOrder
    difficulty_level?: SortOrder
    estimated_minutes?: SortOrderInput | SortOrder
    prerequisites?: SortOrder
    is_completed?: SortOrder
    completed_at?: SortOrderInput | SortOrder
    user_notes?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: LearningTaskCountOrderByAggregateInput
    _avg?: LearningTaskAvgOrderByAggregateInput
    _max?: LearningTaskMaxOrderByAggregateInput
    _min?: LearningTaskMinOrderByAggregateInput
    _sum?: LearningTaskSumOrderByAggregateInput
  }

  export type LearningTaskScalarWhereWithAggregatesInput = {
    AND?: LearningTaskScalarWhereWithAggregatesInput | LearningTaskScalarWhereWithAggregatesInput[]
    OR?: LearningTaskScalarWhereWithAggregatesInput[]
    NOT?: LearningTaskScalarWhereWithAggregatesInput | LearningTaskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LearningTask"> | string
    learning_session_id?: StringWithAggregatesFilter<"LearningTask"> | string
    title?: StringWithAggregatesFilter<"LearningTask"> | string
    description?: StringWithAggregatesFilter<"LearningTask"> | string
    instructions?: StringWithAggregatesFilter<"LearningTask"> | string
    category?: StringWithAggregatesFilter<"LearningTask"> | string
    difficulty_level?: IntWithAggregatesFilter<"LearningTask"> | number
    estimated_minutes?: IntNullableWithAggregatesFilter<"LearningTask"> | number | null
    prerequisites?: StringNullableListFilter<"LearningTask">
    is_completed?: BoolWithAggregatesFilter<"LearningTask"> | boolean
    completed_at?: DateTimeNullableWithAggregatesFilter<"LearningTask"> | Date | string | null
    user_notes?: StringNullableWithAggregatesFilter<"LearningTask"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"LearningTask"> | Date | string
  }

  export type LearningProgressWhereInput = {
    AND?: LearningProgressWhereInput | LearningProgressWhereInput[]
    OR?: LearningProgressWhereInput[]
    NOT?: LearningProgressWhereInput | LearningProgressWhereInput[]
    id?: StringFilter<"LearningProgress"> | string
    learning_session_id?: StringFilter<"LearningProgress"> | string
    category?: StringFilter<"LearningProgress"> | string
    mastery_level?: FloatFilter<"LearningProgress"> | number
    tasks_completed?: IntFilter<"LearningProgress"> | number
    total_tasks?: IntFilter<"LearningProgress"> | number
    last_activity?: DateTimeFilter<"LearningProgress"> | Date | string
    learning_session?: XOR<LearningSessionScalarRelationFilter, LearningSessionWhereInput>
  }

  export type LearningProgressOrderByWithRelationInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    category?: SortOrder
    mastery_level?: SortOrder
    tasks_completed?: SortOrder
    total_tasks?: SortOrder
    last_activity?: SortOrder
    learning_session?: LearningSessionOrderByWithRelationInput
  }

  export type LearningProgressWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    learning_session_id_category?: LearningProgressLearning_session_idCategoryCompoundUniqueInput
    AND?: LearningProgressWhereInput | LearningProgressWhereInput[]
    OR?: LearningProgressWhereInput[]
    NOT?: LearningProgressWhereInput | LearningProgressWhereInput[]
    learning_session_id?: StringFilter<"LearningProgress"> | string
    category?: StringFilter<"LearningProgress"> | string
    mastery_level?: FloatFilter<"LearningProgress"> | number
    tasks_completed?: IntFilter<"LearningProgress"> | number
    total_tasks?: IntFilter<"LearningProgress"> | number
    last_activity?: DateTimeFilter<"LearningProgress"> | Date | string
    learning_session?: XOR<LearningSessionScalarRelationFilter, LearningSessionWhereInput>
  }, "id" | "learning_session_id_category">

  export type LearningProgressOrderByWithAggregationInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    category?: SortOrder
    mastery_level?: SortOrder
    tasks_completed?: SortOrder
    total_tasks?: SortOrder
    last_activity?: SortOrder
    _count?: LearningProgressCountOrderByAggregateInput
    _avg?: LearningProgressAvgOrderByAggregateInput
    _max?: LearningProgressMaxOrderByAggregateInput
    _min?: LearningProgressMinOrderByAggregateInput
    _sum?: LearningProgressSumOrderByAggregateInput
  }

  export type LearningProgressScalarWhereWithAggregatesInput = {
    AND?: LearningProgressScalarWhereWithAggregatesInput | LearningProgressScalarWhereWithAggregatesInput[]
    OR?: LearningProgressScalarWhereWithAggregatesInput[]
    NOT?: LearningProgressScalarWhereWithAggregatesInput | LearningProgressScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LearningProgress"> | string
    learning_session_id?: StringWithAggregatesFilter<"LearningProgress"> | string
    category?: StringWithAggregatesFilter<"LearningProgress"> | string
    mastery_level?: FloatWithAggregatesFilter<"LearningProgress"> | number
    tasks_completed?: IntWithAggregatesFilter<"LearningProgress"> | number
    total_tasks?: IntWithAggregatesFilter<"LearningProgress"> | number
    last_activity?: DateTimeWithAggregatesFilter<"LearningProgress"> | Date | string
  }

  export type LearningChatMessageWhereInput = {
    AND?: LearningChatMessageWhereInput | LearningChatMessageWhereInput[]
    OR?: LearningChatMessageWhereInput[]
    NOT?: LearningChatMessageWhereInput | LearningChatMessageWhereInput[]
    id?: StringFilter<"LearningChatMessage"> | string
    learning_session_id?: StringFilter<"LearningChatMessage"> | string
    role?: StringFilter<"LearningChatMessage"> | string
    content?: StringFilter<"LearningChatMessage"> | string
    message_type?: StringFilter<"LearningChatMessage"> | string
    created_at?: DateTimeFilter<"LearningChatMessage"> | Date | string
    learning_session?: XOR<LearningSessionScalarRelationFilter, LearningSessionWhereInput>
  }

  export type LearningChatMessageOrderByWithRelationInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    message_type?: SortOrder
    created_at?: SortOrder
    learning_session?: LearningSessionOrderByWithRelationInput
  }

  export type LearningChatMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LearningChatMessageWhereInput | LearningChatMessageWhereInput[]
    OR?: LearningChatMessageWhereInput[]
    NOT?: LearningChatMessageWhereInput | LearningChatMessageWhereInput[]
    learning_session_id?: StringFilter<"LearningChatMessage"> | string
    role?: StringFilter<"LearningChatMessage"> | string
    content?: StringFilter<"LearningChatMessage"> | string
    message_type?: StringFilter<"LearningChatMessage"> | string
    created_at?: DateTimeFilter<"LearningChatMessage"> | Date | string
    learning_session?: XOR<LearningSessionScalarRelationFilter, LearningSessionWhereInput>
  }, "id">

  export type LearningChatMessageOrderByWithAggregationInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    message_type?: SortOrder
    created_at?: SortOrder
    _count?: LearningChatMessageCountOrderByAggregateInput
    _max?: LearningChatMessageMaxOrderByAggregateInput
    _min?: LearningChatMessageMinOrderByAggregateInput
  }

  export type LearningChatMessageScalarWhereWithAggregatesInput = {
    AND?: LearningChatMessageScalarWhereWithAggregatesInput | LearningChatMessageScalarWhereWithAggregatesInput[]
    OR?: LearningChatMessageScalarWhereWithAggregatesInput[]
    NOT?: LearningChatMessageScalarWhereWithAggregatesInput | LearningChatMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LearningChatMessage"> | string
    learning_session_id?: StringWithAggregatesFilter<"LearningChatMessage"> | string
    role?: StringWithAggregatesFilter<"LearningChatMessage"> | string
    content?: StringWithAggregatesFilter<"LearningChatMessage"> | string
    message_type?: StringWithAggregatesFilter<"LearningChatMessage"> | string
    created_at?: DateTimeWithAggregatesFilter<"LearningChatMessage"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    clients?: ClientCreateNestedManyWithoutUserInput
    projects?: ProjectCreateNestedManyWithoutUserInput
    learning_sessions?: LearningSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    clients?: ClientUncheckedCreateNestedManyWithoutUserInput
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    learning_sessions?: LearningSessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    clients?: ClientUpdateManyWithoutUserNestedInput
    projects?: ProjectUpdateManyWithoutUserNestedInput
    learning_sessions?: LearningSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    clients?: ClientUncheckedUpdateManyWithoutUserNestedInput
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    learning_sessions?: LearningSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientCreateInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    user: UserCreateNestedOneWithoutClientsInput
    projects?: ProjectCreateNestedManyWithoutClientInput
    learning_sessions?: LearningSessionCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    projects?: ProjectUncheckedCreateNestedManyWithoutClientInput
    learning_sessions?: LearningSessionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutClientsNestedInput
    projects?: ProjectUpdateManyWithoutClientNestedInput
    learning_sessions?: LearningSessionUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUncheckedUpdateManyWithoutClientNestedInput
    learning_sessions?: LearningSessionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ClientCreateManyInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
  }

  export type ClientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProjectCreateInput = {
    id?: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
    user: UserCreateNestedOneWithoutProjectsInput
    client: ClientCreateNestedOneWithoutProjectsInput
  }

  export type ProjectUncheckedCreateInput = {
    id?: string
    client_id: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
  }

  export type ProjectUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutProjectsNestedInput
    client?: ClientUpdateOneRequiredWithoutProjectsNestedInput
  }

  export type ProjectUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProjectCreateManyInput = {
    id?: string
    client_id: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
  }

  export type ProjectUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProjectUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LearningSessionCreateInput = {
    id?: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutLearning_sessionsInput
    client: ClientCreateNestedOneWithoutLearning_sessionsInput
    tasks?: LearningTaskCreateNestedManyWithoutLearning_sessionInput
    progress?: LearningProgressCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionUncheckedCreateInput = {
    id?: string
    client_id: string
    user_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    tasks?: LearningTaskUncheckedCreateNestedManyWithoutLearning_sessionInput
    progress?: LearningProgressUncheckedCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageUncheckedCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLearning_sessionsNestedInput
    client?: ClientUpdateOneRequiredWithoutLearning_sessionsNestedInput
    tasks?: LearningTaskUpdateManyWithoutLearning_sessionNestedInput
    progress?: LearningProgressUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: LearningTaskUncheckedUpdateManyWithoutLearning_sessionNestedInput
    progress?: LearningProgressUncheckedUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUncheckedUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionCreateManyInput = {
    id?: string
    client_id: string
    user_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type LearningSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningTaskCreateInput = {
    id?: string
    title: string
    description: string
    instructions: string
    category: string
    difficulty_level?: number
    estimated_minutes?: number | null
    prerequisites?: LearningTaskCreateprerequisitesInput | string[]
    is_completed?: boolean
    completed_at?: Date | string | null
    user_notes?: string | null
    created_at?: Date | string
    learning_session: LearningSessionCreateNestedOneWithoutTasksInput
  }

  export type LearningTaskUncheckedCreateInput = {
    id?: string
    learning_session_id: string
    title: string
    description: string
    instructions: string
    category: string
    difficulty_level?: number
    estimated_minutes?: number | null
    prerequisites?: LearningTaskCreateprerequisitesInput | string[]
    is_completed?: boolean
    completed_at?: Date | string | null
    user_notes?: string | null
    created_at?: Date | string
  }

  export type LearningTaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    instructions?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    difficulty_level?: IntFieldUpdateOperationsInput | number
    estimated_minutes?: NullableIntFieldUpdateOperationsInput | number | null
    prerequisites?: LearningTaskUpdateprerequisitesInput | string[]
    is_completed?: BoolFieldUpdateOperationsInput | boolean
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    learning_session?: LearningSessionUpdateOneRequiredWithoutTasksNestedInput
  }

  export type LearningTaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    learning_session_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    instructions?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    difficulty_level?: IntFieldUpdateOperationsInput | number
    estimated_minutes?: NullableIntFieldUpdateOperationsInput | number | null
    prerequisites?: LearningTaskUpdateprerequisitesInput | string[]
    is_completed?: BoolFieldUpdateOperationsInput | boolean
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningTaskCreateManyInput = {
    id?: string
    learning_session_id: string
    title: string
    description: string
    instructions: string
    category: string
    difficulty_level?: number
    estimated_minutes?: number | null
    prerequisites?: LearningTaskCreateprerequisitesInput | string[]
    is_completed?: boolean
    completed_at?: Date | string | null
    user_notes?: string | null
    created_at?: Date | string
  }

  export type LearningTaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    instructions?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    difficulty_level?: IntFieldUpdateOperationsInput | number
    estimated_minutes?: NullableIntFieldUpdateOperationsInput | number | null
    prerequisites?: LearningTaskUpdateprerequisitesInput | string[]
    is_completed?: BoolFieldUpdateOperationsInput | boolean
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningTaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    learning_session_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    instructions?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    difficulty_level?: IntFieldUpdateOperationsInput | number
    estimated_minutes?: NullableIntFieldUpdateOperationsInput | number | null
    prerequisites?: LearningTaskUpdateprerequisitesInput | string[]
    is_completed?: BoolFieldUpdateOperationsInput | boolean
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningProgressCreateInput = {
    id?: string
    category: string
    mastery_level?: number
    tasks_completed?: number
    total_tasks?: number
    last_activity?: Date | string
    learning_session: LearningSessionCreateNestedOneWithoutProgressInput
  }

  export type LearningProgressUncheckedCreateInput = {
    id?: string
    learning_session_id: string
    category: string
    mastery_level?: number
    tasks_completed?: number
    total_tasks?: number
    last_activity?: Date | string
  }

  export type LearningProgressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    mastery_level?: FloatFieldUpdateOperationsInput | number
    tasks_completed?: IntFieldUpdateOperationsInput | number
    total_tasks?: IntFieldUpdateOperationsInput | number
    last_activity?: DateTimeFieldUpdateOperationsInput | Date | string
    learning_session?: LearningSessionUpdateOneRequiredWithoutProgressNestedInput
  }

  export type LearningProgressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    learning_session_id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    mastery_level?: FloatFieldUpdateOperationsInput | number
    tasks_completed?: IntFieldUpdateOperationsInput | number
    total_tasks?: IntFieldUpdateOperationsInput | number
    last_activity?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningProgressCreateManyInput = {
    id?: string
    learning_session_id: string
    category: string
    mastery_level?: number
    tasks_completed?: number
    total_tasks?: number
    last_activity?: Date | string
  }

  export type LearningProgressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    mastery_level?: FloatFieldUpdateOperationsInput | number
    tasks_completed?: IntFieldUpdateOperationsInput | number
    total_tasks?: IntFieldUpdateOperationsInput | number
    last_activity?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningProgressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    learning_session_id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    mastery_level?: FloatFieldUpdateOperationsInput | number
    tasks_completed?: IntFieldUpdateOperationsInput | number
    total_tasks?: IntFieldUpdateOperationsInput | number
    last_activity?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningChatMessageCreateInput = {
    id?: string
    role: string
    content: string
    message_type?: string
    created_at?: Date | string
    learning_session: LearningSessionCreateNestedOneWithoutChat_messagesInput
  }

  export type LearningChatMessageUncheckedCreateInput = {
    id?: string
    learning_session_id: string
    role: string
    content: string
    message_type?: string
    created_at?: Date | string
  }

  export type LearningChatMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    message_type?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    learning_session?: LearningSessionUpdateOneRequiredWithoutChat_messagesNestedInput
  }

  export type LearningChatMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    learning_session_id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    message_type?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningChatMessageCreateManyInput = {
    id?: string
    learning_session_id: string
    role: string
    content: string
    message_type?: string
    created_at?: Date | string
  }

  export type LearningChatMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    message_type?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningChatMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    learning_session_id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    message_type?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ClientListRelationFilter = {
    every?: ClientWhereInput
    some?: ClientWhereInput
    none?: ClientWhereInput
  }

  export type ProjectListRelationFilter = {
    every?: ProjectWhereInput
    some?: ProjectWhereInput
    none?: ProjectWhereInput
  }

  export type LearningSessionListRelationFilter = {
    every?: LearningSessionWhereInput
    some?: LearningSessionWhereInput
    none?: LearningSessionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ClientOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProjectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LearningSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ClientCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    company?: SortOrder
    email?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrder
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
    scraped_at?: SortOrder
    scraped_url?: SortOrder
  }

  export type ClientAvgOrderByAggregateInput = {
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
  }

  export type ClientMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    company?: SortOrder
    email?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrder
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
    scraped_at?: SortOrder
    scraped_url?: SortOrder
  }

  export type ClientMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    company?: SortOrder
    email?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrder
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
    scraped_at?: SortOrder
    scraped_url?: SortOrder
  }

  export type ClientSumOrderByAggregateInput = {
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ClientScalarRelationFilter = {
    is?: ClientWhereInput
    isNot?: ClientWhereInput
  }

  export type ProjectCountOrderByAggregateInput = {
    id?: SortOrder
    client_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    documentation_urls?: SortOrder
    prompt?: SortOrder
    status?: SortOrder
    script?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrder
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
    scraped_at?: SortOrder
    scraped_url?: SortOrder
    video_type?: SortOrder
  }

  export type ProjectAvgOrderByAggregateInput = {
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
  }

  export type ProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    client_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    prompt?: SortOrder
    status?: SortOrder
    script?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrder
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
    scraped_at?: SortOrder
    scraped_url?: SortOrder
    video_type?: SortOrder
  }

  export type ProjectMinOrderByAggregateInput = {
    id?: SortOrder
    client_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    prompt?: SortOrder
    status?: SortOrder
    script?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    scraped_content?: SortOrder
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
    scraped_at?: SortOrder
    scraped_url?: SortOrder
    video_type?: SortOrder
  }

  export type ProjectSumOrderByAggregateInput = {
    scraped_pages?: SortOrder
    scraped_chars?: SortOrder
    scraped_words?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type LearningTaskListRelationFilter = {
    every?: LearningTaskWhereInput
    some?: LearningTaskWhereInput
    none?: LearningTaskWhereInput
  }

  export type LearningProgressListRelationFilter = {
    every?: LearningProgressWhereInput
    some?: LearningProgressWhereInput
    none?: LearningProgressWhereInput
  }

  export type LearningChatMessageListRelationFilter = {
    every?: LearningChatMessageWhereInput
    some?: LearningChatMessageWhereInput
    none?: LearningChatMessageWhereInput
  }

  export type LearningTaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LearningProgressOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LearningChatMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LearningSessionCountOrderByAggregateInput = {
    id?: SortOrder
    client_id?: SortOrder
    user_id?: SortOrder
    software_name?: SortOrder
    documentation_summary?: SortOrder
    current_phase?: SortOrder
    completion_percentage?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type LearningSessionAvgOrderByAggregateInput = {
    completion_percentage?: SortOrder
  }

  export type LearningSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    client_id?: SortOrder
    user_id?: SortOrder
    software_name?: SortOrder
    documentation_summary?: SortOrder
    current_phase?: SortOrder
    completion_percentage?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type LearningSessionMinOrderByAggregateInput = {
    id?: SortOrder
    client_id?: SortOrder
    user_id?: SortOrder
    software_name?: SortOrder
    documentation_summary?: SortOrder
    current_phase?: SortOrder
    completion_percentage?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type LearningSessionSumOrderByAggregateInput = {
    completion_percentage?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type LearningSessionScalarRelationFilter = {
    is?: LearningSessionWhereInput
    isNot?: LearningSessionWhereInput
  }

  export type LearningTaskCountOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    instructions?: SortOrder
    category?: SortOrder
    difficulty_level?: SortOrder
    estimated_minutes?: SortOrder
    prerequisites?: SortOrder
    is_completed?: SortOrder
    completed_at?: SortOrder
    user_notes?: SortOrder
    created_at?: SortOrder
  }

  export type LearningTaskAvgOrderByAggregateInput = {
    difficulty_level?: SortOrder
    estimated_minutes?: SortOrder
  }

  export type LearningTaskMaxOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    instructions?: SortOrder
    category?: SortOrder
    difficulty_level?: SortOrder
    estimated_minutes?: SortOrder
    is_completed?: SortOrder
    completed_at?: SortOrder
    user_notes?: SortOrder
    created_at?: SortOrder
  }

  export type LearningTaskMinOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    instructions?: SortOrder
    category?: SortOrder
    difficulty_level?: SortOrder
    estimated_minutes?: SortOrder
    is_completed?: SortOrder
    completed_at?: SortOrder
    user_notes?: SortOrder
    created_at?: SortOrder
  }

  export type LearningTaskSumOrderByAggregateInput = {
    difficulty_level?: SortOrder
    estimated_minutes?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type LearningProgressLearning_session_idCategoryCompoundUniqueInput = {
    learning_session_id: string
    category: string
  }

  export type LearningProgressCountOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    category?: SortOrder
    mastery_level?: SortOrder
    tasks_completed?: SortOrder
    total_tasks?: SortOrder
    last_activity?: SortOrder
  }

  export type LearningProgressAvgOrderByAggregateInput = {
    mastery_level?: SortOrder
    tasks_completed?: SortOrder
    total_tasks?: SortOrder
  }

  export type LearningProgressMaxOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    category?: SortOrder
    mastery_level?: SortOrder
    tasks_completed?: SortOrder
    total_tasks?: SortOrder
    last_activity?: SortOrder
  }

  export type LearningProgressMinOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    category?: SortOrder
    mastery_level?: SortOrder
    tasks_completed?: SortOrder
    total_tasks?: SortOrder
    last_activity?: SortOrder
  }

  export type LearningProgressSumOrderByAggregateInput = {
    mastery_level?: SortOrder
    tasks_completed?: SortOrder
    total_tasks?: SortOrder
  }

  export type LearningChatMessageCountOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    message_type?: SortOrder
    created_at?: SortOrder
  }

  export type LearningChatMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    message_type?: SortOrder
    created_at?: SortOrder
  }

  export type LearningChatMessageMinOrderByAggregateInput = {
    id?: SortOrder
    learning_session_id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    message_type?: SortOrder
    created_at?: SortOrder
  }

  export type ClientCreateNestedManyWithoutUserInput = {
    create?: XOR<ClientCreateWithoutUserInput, ClientUncheckedCreateWithoutUserInput> | ClientCreateWithoutUserInput[] | ClientUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClientCreateOrConnectWithoutUserInput | ClientCreateOrConnectWithoutUserInput[]
    createMany?: ClientCreateManyUserInputEnvelope
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
  }

  export type ProjectCreateNestedManyWithoutUserInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type LearningSessionCreateNestedManyWithoutUserInput = {
    create?: XOR<LearningSessionCreateWithoutUserInput, LearningSessionUncheckedCreateWithoutUserInput> | LearningSessionCreateWithoutUserInput[] | LearningSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LearningSessionCreateOrConnectWithoutUserInput | LearningSessionCreateOrConnectWithoutUserInput[]
    createMany?: LearningSessionCreateManyUserInputEnvelope
    connect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
  }

  export type ClientUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ClientCreateWithoutUserInput, ClientUncheckedCreateWithoutUserInput> | ClientCreateWithoutUserInput[] | ClientUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClientCreateOrConnectWithoutUserInput | ClientCreateOrConnectWithoutUserInput[]
    createMany?: ClientCreateManyUserInputEnvelope
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
  }

  export type ProjectUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type LearningSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<LearningSessionCreateWithoutUserInput, LearningSessionUncheckedCreateWithoutUserInput> | LearningSessionCreateWithoutUserInput[] | LearningSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LearningSessionCreateOrConnectWithoutUserInput | LearningSessionCreateOrConnectWithoutUserInput[]
    createMany?: LearningSessionCreateManyUserInputEnvelope
    connect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ClientUpdateManyWithoutUserNestedInput = {
    create?: XOR<ClientCreateWithoutUserInput, ClientUncheckedCreateWithoutUserInput> | ClientCreateWithoutUserInput[] | ClientUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClientCreateOrConnectWithoutUserInput | ClientCreateOrConnectWithoutUserInput[]
    upsert?: ClientUpsertWithWhereUniqueWithoutUserInput | ClientUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ClientCreateManyUserInputEnvelope
    set?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    disconnect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    delete?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    update?: ClientUpdateWithWhereUniqueWithoutUserInput | ClientUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ClientUpdateManyWithWhereWithoutUserInput | ClientUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ClientScalarWhereInput | ClientScalarWhereInput[]
  }

  export type ProjectUpdateManyWithoutUserNestedInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutUserInput | ProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutUserInput | ProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutUserInput | ProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type LearningSessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<LearningSessionCreateWithoutUserInput, LearningSessionUncheckedCreateWithoutUserInput> | LearningSessionCreateWithoutUserInput[] | LearningSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LearningSessionCreateOrConnectWithoutUserInput | LearningSessionCreateOrConnectWithoutUserInput[]
    upsert?: LearningSessionUpsertWithWhereUniqueWithoutUserInput | LearningSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LearningSessionCreateManyUserInputEnvelope
    set?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    disconnect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    delete?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    connect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    update?: LearningSessionUpdateWithWhereUniqueWithoutUserInput | LearningSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LearningSessionUpdateManyWithWhereWithoutUserInput | LearningSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LearningSessionScalarWhereInput | LearningSessionScalarWhereInput[]
  }

  export type ClientUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ClientCreateWithoutUserInput, ClientUncheckedCreateWithoutUserInput> | ClientCreateWithoutUserInput[] | ClientUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClientCreateOrConnectWithoutUserInput | ClientCreateOrConnectWithoutUserInput[]
    upsert?: ClientUpsertWithWhereUniqueWithoutUserInput | ClientUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ClientCreateManyUserInputEnvelope
    set?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    disconnect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    delete?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    update?: ClientUpdateWithWhereUniqueWithoutUserInput | ClientUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ClientUpdateManyWithWhereWithoutUserInput | ClientUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ClientScalarWhereInput | ClientScalarWhereInput[]
  }

  export type ProjectUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutUserInput | ProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutUserInput | ProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutUserInput | ProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type LearningSessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<LearningSessionCreateWithoutUserInput, LearningSessionUncheckedCreateWithoutUserInput> | LearningSessionCreateWithoutUserInput[] | LearningSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LearningSessionCreateOrConnectWithoutUserInput | LearningSessionCreateOrConnectWithoutUserInput[]
    upsert?: LearningSessionUpsertWithWhereUniqueWithoutUserInput | LearningSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LearningSessionCreateManyUserInputEnvelope
    set?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    disconnect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    delete?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    connect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    update?: LearningSessionUpdateWithWhereUniqueWithoutUserInput | LearningSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LearningSessionUpdateManyWithWhereWithoutUserInput | LearningSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LearningSessionScalarWhereInput | LearningSessionScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutClientsInput = {
    create?: XOR<UserCreateWithoutClientsInput, UserUncheckedCreateWithoutClientsInput>
    connectOrCreate?: UserCreateOrConnectWithoutClientsInput
    connect?: UserWhereUniqueInput
  }

  export type ProjectCreateNestedManyWithoutClientInput = {
    create?: XOR<ProjectCreateWithoutClientInput, ProjectUncheckedCreateWithoutClientInput> | ProjectCreateWithoutClientInput[] | ProjectUncheckedCreateWithoutClientInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutClientInput | ProjectCreateOrConnectWithoutClientInput[]
    createMany?: ProjectCreateManyClientInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type LearningSessionCreateNestedManyWithoutClientInput = {
    create?: XOR<LearningSessionCreateWithoutClientInput, LearningSessionUncheckedCreateWithoutClientInput> | LearningSessionCreateWithoutClientInput[] | LearningSessionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: LearningSessionCreateOrConnectWithoutClientInput | LearningSessionCreateOrConnectWithoutClientInput[]
    createMany?: LearningSessionCreateManyClientInputEnvelope
    connect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
  }

  export type ProjectUncheckedCreateNestedManyWithoutClientInput = {
    create?: XOR<ProjectCreateWithoutClientInput, ProjectUncheckedCreateWithoutClientInput> | ProjectCreateWithoutClientInput[] | ProjectUncheckedCreateWithoutClientInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutClientInput | ProjectCreateOrConnectWithoutClientInput[]
    createMany?: ProjectCreateManyClientInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type LearningSessionUncheckedCreateNestedManyWithoutClientInput = {
    create?: XOR<LearningSessionCreateWithoutClientInput, LearningSessionUncheckedCreateWithoutClientInput> | LearningSessionCreateWithoutClientInput[] | LearningSessionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: LearningSessionCreateOrConnectWithoutClientInput | LearningSessionCreateOrConnectWithoutClientInput[]
    createMany?: LearningSessionCreateManyClientInputEnvelope
    connect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutClientsNestedInput = {
    create?: XOR<UserCreateWithoutClientsInput, UserUncheckedCreateWithoutClientsInput>
    connectOrCreate?: UserCreateOrConnectWithoutClientsInput
    upsert?: UserUpsertWithoutClientsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutClientsInput, UserUpdateWithoutClientsInput>, UserUncheckedUpdateWithoutClientsInput>
  }

  export type ProjectUpdateManyWithoutClientNestedInput = {
    create?: XOR<ProjectCreateWithoutClientInput, ProjectUncheckedCreateWithoutClientInput> | ProjectCreateWithoutClientInput[] | ProjectUncheckedCreateWithoutClientInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutClientInput | ProjectCreateOrConnectWithoutClientInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutClientInput | ProjectUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: ProjectCreateManyClientInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutClientInput | ProjectUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutClientInput | ProjectUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type LearningSessionUpdateManyWithoutClientNestedInput = {
    create?: XOR<LearningSessionCreateWithoutClientInput, LearningSessionUncheckedCreateWithoutClientInput> | LearningSessionCreateWithoutClientInput[] | LearningSessionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: LearningSessionCreateOrConnectWithoutClientInput | LearningSessionCreateOrConnectWithoutClientInput[]
    upsert?: LearningSessionUpsertWithWhereUniqueWithoutClientInput | LearningSessionUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: LearningSessionCreateManyClientInputEnvelope
    set?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    disconnect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    delete?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    connect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    update?: LearningSessionUpdateWithWhereUniqueWithoutClientInput | LearningSessionUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: LearningSessionUpdateManyWithWhereWithoutClientInput | LearningSessionUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: LearningSessionScalarWhereInput | LearningSessionScalarWhereInput[]
  }

  export type ProjectUncheckedUpdateManyWithoutClientNestedInput = {
    create?: XOR<ProjectCreateWithoutClientInput, ProjectUncheckedCreateWithoutClientInput> | ProjectCreateWithoutClientInput[] | ProjectUncheckedCreateWithoutClientInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutClientInput | ProjectCreateOrConnectWithoutClientInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutClientInput | ProjectUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: ProjectCreateManyClientInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutClientInput | ProjectUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutClientInput | ProjectUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type LearningSessionUncheckedUpdateManyWithoutClientNestedInput = {
    create?: XOR<LearningSessionCreateWithoutClientInput, LearningSessionUncheckedCreateWithoutClientInput> | LearningSessionCreateWithoutClientInput[] | LearningSessionUncheckedCreateWithoutClientInput[]
    connectOrCreate?: LearningSessionCreateOrConnectWithoutClientInput | LearningSessionCreateOrConnectWithoutClientInput[]
    upsert?: LearningSessionUpsertWithWhereUniqueWithoutClientInput | LearningSessionUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: LearningSessionCreateManyClientInputEnvelope
    set?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    disconnect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    delete?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    connect?: LearningSessionWhereUniqueInput | LearningSessionWhereUniqueInput[]
    update?: LearningSessionUpdateWithWhereUniqueWithoutClientInput | LearningSessionUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: LearningSessionUpdateManyWithWhereWithoutClientInput | LearningSessionUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: LearningSessionScalarWhereInput | LearningSessionScalarWhereInput[]
  }

  export type ProjectCreatedocumentation_urlsInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutProjectsInput = {
    create?: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProjectsInput
    connect?: UserWhereUniqueInput
  }

  export type ClientCreateNestedOneWithoutProjectsInput = {
    create?: XOR<ClientCreateWithoutProjectsInput, ClientUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: ClientCreateOrConnectWithoutProjectsInput
    connect?: ClientWhereUniqueInput
  }

  export type ProjectUpdatedocumentation_urlsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneRequiredWithoutProjectsNestedInput = {
    create?: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProjectsInput
    upsert?: UserUpsertWithoutProjectsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProjectsInput, UserUpdateWithoutProjectsInput>, UserUncheckedUpdateWithoutProjectsInput>
  }

  export type ClientUpdateOneRequiredWithoutProjectsNestedInput = {
    create?: XOR<ClientCreateWithoutProjectsInput, ClientUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: ClientCreateOrConnectWithoutProjectsInput
    upsert?: ClientUpsertWithoutProjectsInput
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutProjectsInput, ClientUpdateWithoutProjectsInput>, ClientUncheckedUpdateWithoutProjectsInput>
  }

  export type UserCreateNestedOneWithoutLearning_sessionsInput = {
    create?: XOR<UserCreateWithoutLearning_sessionsInput, UserUncheckedCreateWithoutLearning_sessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLearning_sessionsInput
    connect?: UserWhereUniqueInput
  }

  export type ClientCreateNestedOneWithoutLearning_sessionsInput = {
    create?: XOR<ClientCreateWithoutLearning_sessionsInput, ClientUncheckedCreateWithoutLearning_sessionsInput>
    connectOrCreate?: ClientCreateOrConnectWithoutLearning_sessionsInput
    connect?: ClientWhereUniqueInput
  }

  export type LearningTaskCreateNestedManyWithoutLearning_sessionInput = {
    create?: XOR<LearningTaskCreateWithoutLearning_sessionInput, LearningTaskUncheckedCreateWithoutLearning_sessionInput> | LearningTaskCreateWithoutLearning_sessionInput[] | LearningTaskUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningTaskCreateOrConnectWithoutLearning_sessionInput | LearningTaskCreateOrConnectWithoutLearning_sessionInput[]
    createMany?: LearningTaskCreateManyLearning_sessionInputEnvelope
    connect?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
  }

  export type LearningProgressCreateNestedManyWithoutLearning_sessionInput = {
    create?: XOR<LearningProgressCreateWithoutLearning_sessionInput, LearningProgressUncheckedCreateWithoutLearning_sessionInput> | LearningProgressCreateWithoutLearning_sessionInput[] | LearningProgressUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningProgressCreateOrConnectWithoutLearning_sessionInput | LearningProgressCreateOrConnectWithoutLearning_sessionInput[]
    createMany?: LearningProgressCreateManyLearning_sessionInputEnvelope
    connect?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
  }

  export type LearningChatMessageCreateNestedManyWithoutLearning_sessionInput = {
    create?: XOR<LearningChatMessageCreateWithoutLearning_sessionInput, LearningChatMessageUncheckedCreateWithoutLearning_sessionInput> | LearningChatMessageCreateWithoutLearning_sessionInput[] | LearningChatMessageUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningChatMessageCreateOrConnectWithoutLearning_sessionInput | LearningChatMessageCreateOrConnectWithoutLearning_sessionInput[]
    createMany?: LearningChatMessageCreateManyLearning_sessionInputEnvelope
    connect?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
  }

  export type LearningTaskUncheckedCreateNestedManyWithoutLearning_sessionInput = {
    create?: XOR<LearningTaskCreateWithoutLearning_sessionInput, LearningTaskUncheckedCreateWithoutLearning_sessionInput> | LearningTaskCreateWithoutLearning_sessionInput[] | LearningTaskUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningTaskCreateOrConnectWithoutLearning_sessionInput | LearningTaskCreateOrConnectWithoutLearning_sessionInput[]
    createMany?: LearningTaskCreateManyLearning_sessionInputEnvelope
    connect?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
  }

  export type LearningProgressUncheckedCreateNestedManyWithoutLearning_sessionInput = {
    create?: XOR<LearningProgressCreateWithoutLearning_sessionInput, LearningProgressUncheckedCreateWithoutLearning_sessionInput> | LearningProgressCreateWithoutLearning_sessionInput[] | LearningProgressUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningProgressCreateOrConnectWithoutLearning_sessionInput | LearningProgressCreateOrConnectWithoutLearning_sessionInput[]
    createMany?: LearningProgressCreateManyLearning_sessionInputEnvelope
    connect?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
  }

  export type LearningChatMessageUncheckedCreateNestedManyWithoutLearning_sessionInput = {
    create?: XOR<LearningChatMessageCreateWithoutLearning_sessionInput, LearningChatMessageUncheckedCreateWithoutLearning_sessionInput> | LearningChatMessageCreateWithoutLearning_sessionInput[] | LearningChatMessageUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningChatMessageCreateOrConnectWithoutLearning_sessionInput | LearningChatMessageCreateOrConnectWithoutLearning_sessionInput[]
    createMany?: LearningChatMessageCreateManyLearning_sessionInputEnvelope
    connect?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutLearning_sessionsNestedInput = {
    create?: XOR<UserCreateWithoutLearning_sessionsInput, UserUncheckedCreateWithoutLearning_sessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLearning_sessionsInput
    upsert?: UserUpsertWithoutLearning_sessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLearning_sessionsInput, UserUpdateWithoutLearning_sessionsInput>, UserUncheckedUpdateWithoutLearning_sessionsInput>
  }

  export type ClientUpdateOneRequiredWithoutLearning_sessionsNestedInput = {
    create?: XOR<ClientCreateWithoutLearning_sessionsInput, ClientUncheckedCreateWithoutLearning_sessionsInput>
    connectOrCreate?: ClientCreateOrConnectWithoutLearning_sessionsInput
    upsert?: ClientUpsertWithoutLearning_sessionsInput
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutLearning_sessionsInput, ClientUpdateWithoutLearning_sessionsInput>, ClientUncheckedUpdateWithoutLearning_sessionsInput>
  }

  export type LearningTaskUpdateManyWithoutLearning_sessionNestedInput = {
    create?: XOR<LearningTaskCreateWithoutLearning_sessionInput, LearningTaskUncheckedCreateWithoutLearning_sessionInput> | LearningTaskCreateWithoutLearning_sessionInput[] | LearningTaskUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningTaskCreateOrConnectWithoutLearning_sessionInput | LearningTaskCreateOrConnectWithoutLearning_sessionInput[]
    upsert?: LearningTaskUpsertWithWhereUniqueWithoutLearning_sessionInput | LearningTaskUpsertWithWhereUniqueWithoutLearning_sessionInput[]
    createMany?: LearningTaskCreateManyLearning_sessionInputEnvelope
    set?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
    disconnect?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
    delete?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
    connect?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
    update?: LearningTaskUpdateWithWhereUniqueWithoutLearning_sessionInput | LearningTaskUpdateWithWhereUniqueWithoutLearning_sessionInput[]
    updateMany?: LearningTaskUpdateManyWithWhereWithoutLearning_sessionInput | LearningTaskUpdateManyWithWhereWithoutLearning_sessionInput[]
    deleteMany?: LearningTaskScalarWhereInput | LearningTaskScalarWhereInput[]
  }

  export type LearningProgressUpdateManyWithoutLearning_sessionNestedInput = {
    create?: XOR<LearningProgressCreateWithoutLearning_sessionInput, LearningProgressUncheckedCreateWithoutLearning_sessionInput> | LearningProgressCreateWithoutLearning_sessionInput[] | LearningProgressUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningProgressCreateOrConnectWithoutLearning_sessionInput | LearningProgressCreateOrConnectWithoutLearning_sessionInput[]
    upsert?: LearningProgressUpsertWithWhereUniqueWithoutLearning_sessionInput | LearningProgressUpsertWithWhereUniqueWithoutLearning_sessionInput[]
    createMany?: LearningProgressCreateManyLearning_sessionInputEnvelope
    set?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
    disconnect?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
    delete?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
    connect?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
    update?: LearningProgressUpdateWithWhereUniqueWithoutLearning_sessionInput | LearningProgressUpdateWithWhereUniqueWithoutLearning_sessionInput[]
    updateMany?: LearningProgressUpdateManyWithWhereWithoutLearning_sessionInput | LearningProgressUpdateManyWithWhereWithoutLearning_sessionInput[]
    deleteMany?: LearningProgressScalarWhereInput | LearningProgressScalarWhereInput[]
  }

  export type LearningChatMessageUpdateManyWithoutLearning_sessionNestedInput = {
    create?: XOR<LearningChatMessageCreateWithoutLearning_sessionInput, LearningChatMessageUncheckedCreateWithoutLearning_sessionInput> | LearningChatMessageCreateWithoutLearning_sessionInput[] | LearningChatMessageUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningChatMessageCreateOrConnectWithoutLearning_sessionInput | LearningChatMessageCreateOrConnectWithoutLearning_sessionInput[]
    upsert?: LearningChatMessageUpsertWithWhereUniqueWithoutLearning_sessionInput | LearningChatMessageUpsertWithWhereUniqueWithoutLearning_sessionInput[]
    createMany?: LearningChatMessageCreateManyLearning_sessionInputEnvelope
    set?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
    disconnect?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
    delete?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
    connect?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
    update?: LearningChatMessageUpdateWithWhereUniqueWithoutLearning_sessionInput | LearningChatMessageUpdateWithWhereUniqueWithoutLearning_sessionInput[]
    updateMany?: LearningChatMessageUpdateManyWithWhereWithoutLearning_sessionInput | LearningChatMessageUpdateManyWithWhereWithoutLearning_sessionInput[]
    deleteMany?: LearningChatMessageScalarWhereInput | LearningChatMessageScalarWhereInput[]
  }

  export type LearningTaskUncheckedUpdateManyWithoutLearning_sessionNestedInput = {
    create?: XOR<LearningTaskCreateWithoutLearning_sessionInput, LearningTaskUncheckedCreateWithoutLearning_sessionInput> | LearningTaskCreateWithoutLearning_sessionInput[] | LearningTaskUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningTaskCreateOrConnectWithoutLearning_sessionInput | LearningTaskCreateOrConnectWithoutLearning_sessionInput[]
    upsert?: LearningTaskUpsertWithWhereUniqueWithoutLearning_sessionInput | LearningTaskUpsertWithWhereUniqueWithoutLearning_sessionInput[]
    createMany?: LearningTaskCreateManyLearning_sessionInputEnvelope
    set?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
    disconnect?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
    delete?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
    connect?: LearningTaskWhereUniqueInput | LearningTaskWhereUniqueInput[]
    update?: LearningTaskUpdateWithWhereUniqueWithoutLearning_sessionInput | LearningTaskUpdateWithWhereUniqueWithoutLearning_sessionInput[]
    updateMany?: LearningTaskUpdateManyWithWhereWithoutLearning_sessionInput | LearningTaskUpdateManyWithWhereWithoutLearning_sessionInput[]
    deleteMany?: LearningTaskScalarWhereInput | LearningTaskScalarWhereInput[]
  }

  export type LearningProgressUncheckedUpdateManyWithoutLearning_sessionNestedInput = {
    create?: XOR<LearningProgressCreateWithoutLearning_sessionInput, LearningProgressUncheckedCreateWithoutLearning_sessionInput> | LearningProgressCreateWithoutLearning_sessionInput[] | LearningProgressUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningProgressCreateOrConnectWithoutLearning_sessionInput | LearningProgressCreateOrConnectWithoutLearning_sessionInput[]
    upsert?: LearningProgressUpsertWithWhereUniqueWithoutLearning_sessionInput | LearningProgressUpsertWithWhereUniqueWithoutLearning_sessionInput[]
    createMany?: LearningProgressCreateManyLearning_sessionInputEnvelope
    set?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
    disconnect?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
    delete?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
    connect?: LearningProgressWhereUniqueInput | LearningProgressWhereUniqueInput[]
    update?: LearningProgressUpdateWithWhereUniqueWithoutLearning_sessionInput | LearningProgressUpdateWithWhereUniqueWithoutLearning_sessionInput[]
    updateMany?: LearningProgressUpdateManyWithWhereWithoutLearning_sessionInput | LearningProgressUpdateManyWithWhereWithoutLearning_sessionInput[]
    deleteMany?: LearningProgressScalarWhereInput | LearningProgressScalarWhereInput[]
  }

  export type LearningChatMessageUncheckedUpdateManyWithoutLearning_sessionNestedInput = {
    create?: XOR<LearningChatMessageCreateWithoutLearning_sessionInput, LearningChatMessageUncheckedCreateWithoutLearning_sessionInput> | LearningChatMessageCreateWithoutLearning_sessionInput[] | LearningChatMessageUncheckedCreateWithoutLearning_sessionInput[]
    connectOrCreate?: LearningChatMessageCreateOrConnectWithoutLearning_sessionInput | LearningChatMessageCreateOrConnectWithoutLearning_sessionInput[]
    upsert?: LearningChatMessageUpsertWithWhereUniqueWithoutLearning_sessionInput | LearningChatMessageUpsertWithWhereUniqueWithoutLearning_sessionInput[]
    createMany?: LearningChatMessageCreateManyLearning_sessionInputEnvelope
    set?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
    disconnect?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
    delete?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
    connect?: LearningChatMessageWhereUniqueInput | LearningChatMessageWhereUniqueInput[]
    update?: LearningChatMessageUpdateWithWhereUniqueWithoutLearning_sessionInput | LearningChatMessageUpdateWithWhereUniqueWithoutLearning_sessionInput[]
    updateMany?: LearningChatMessageUpdateManyWithWhereWithoutLearning_sessionInput | LearningChatMessageUpdateManyWithWhereWithoutLearning_sessionInput[]
    deleteMany?: LearningChatMessageScalarWhereInput | LearningChatMessageScalarWhereInput[]
  }

  export type LearningTaskCreateprerequisitesInput = {
    set: string[]
  }

  export type LearningSessionCreateNestedOneWithoutTasksInput = {
    create?: XOR<LearningSessionCreateWithoutTasksInput, LearningSessionUncheckedCreateWithoutTasksInput>
    connectOrCreate?: LearningSessionCreateOrConnectWithoutTasksInput
    connect?: LearningSessionWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type LearningTaskUpdateprerequisitesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type LearningSessionUpdateOneRequiredWithoutTasksNestedInput = {
    create?: XOR<LearningSessionCreateWithoutTasksInput, LearningSessionUncheckedCreateWithoutTasksInput>
    connectOrCreate?: LearningSessionCreateOrConnectWithoutTasksInput
    upsert?: LearningSessionUpsertWithoutTasksInput
    connect?: LearningSessionWhereUniqueInput
    update?: XOR<XOR<LearningSessionUpdateToOneWithWhereWithoutTasksInput, LearningSessionUpdateWithoutTasksInput>, LearningSessionUncheckedUpdateWithoutTasksInput>
  }

  export type LearningSessionCreateNestedOneWithoutProgressInput = {
    create?: XOR<LearningSessionCreateWithoutProgressInput, LearningSessionUncheckedCreateWithoutProgressInput>
    connectOrCreate?: LearningSessionCreateOrConnectWithoutProgressInput
    connect?: LearningSessionWhereUniqueInput
  }

  export type LearningSessionUpdateOneRequiredWithoutProgressNestedInput = {
    create?: XOR<LearningSessionCreateWithoutProgressInput, LearningSessionUncheckedCreateWithoutProgressInput>
    connectOrCreate?: LearningSessionCreateOrConnectWithoutProgressInput
    upsert?: LearningSessionUpsertWithoutProgressInput
    connect?: LearningSessionWhereUniqueInput
    update?: XOR<XOR<LearningSessionUpdateToOneWithWhereWithoutProgressInput, LearningSessionUpdateWithoutProgressInput>, LearningSessionUncheckedUpdateWithoutProgressInput>
  }

  export type LearningSessionCreateNestedOneWithoutChat_messagesInput = {
    create?: XOR<LearningSessionCreateWithoutChat_messagesInput, LearningSessionUncheckedCreateWithoutChat_messagesInput>
    connectOrCreate?: LearningSessionCreateOrConnectWithoutChat_messagesInput
    connect?: LearningSessionWhereUniqueInput
  }

  export type LearningSessionUpdateOneRequiredWithoutChat_messagesNestedInput = {
    create?: XOR<LearningSessionCreateWithoutChat_messagesInput, LearningSessionUncheckedCreateWithoutChat_messagesInput>
    connectOrCreate?: LearningSessionCreateOrConnectWithoutChat_messagesInput
    upsert?: LearningSessionUpsertWithoutChat_messagesInput
    connect?: LearningSessionWhereUniqueInput
    update?: XOR<XOR<LearningSessionUpdateToOneWithWhereWithoutChat_messagesInput, LearningSessionUpdateWithoutChat_messagesInput>, LearningSessionUncheckedUpdateWithoutChat_messagesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ClientCreateWithoutUserInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    projects?: ProjectCreateNestedManyWithoutClientInput
    learning_sessions?: LearningSessionCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    projects?: ProjectUncheckedCreateNestedManyWithoutClientInput
    learning_sessions?: LearningSessionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutUserInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutUserInput, ClientUncheckedCreateWithoutUserInput>
  }

  export type ClientCreateManyUserInputEnvelope = {
    data: ClientCreateManyUserInput | ClientCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ProjectCreateWithoutUserInput = {
    id?: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
    client: ClientCreateNestedOneWithoutProjectsInput
  }

  export type ProjectUncheckedCreateWithoutUserInput = {
    id?: string
    client_id: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
  }

  export type ProjectCreateOrConnectWithoutUserInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput>
  }

  export type ProjectCreateManyUserInputEnvelope = {
    data: ProjectCreateManyUserInput | ProjectCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type LearningSessionCreateWithoutUserInput = {
    id?: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    client: ClientCreateNestedOneWithoutLearning_sessionsInput
    tasks?: LearningTaskCreateNestedManyWithoutLearning_sessionInput
    progress?: LearningProgressCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionUncheckedCreateWithoutUserInput = {
    id?: string
    client_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    tasks?: LearningTaskUncheckedCreateNestedManyWithoutLearning_sessionInput
    progress?: LearningProgressUncheckedCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageUncheckedCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionCreateOrConnectWithoutUserInput = {
    where: LearningSessionWhereUniqueInput
    create: XOR<LearningSessionCreateWithoutUserInput, LearningSessionUncheckedCreateWithoutUserInput>
  }

  export type LearningSessionCreateManyUserInputEnvelope = {
    data: LearningSessionCreateManyUserInput | LearningSessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ClientUpsertWithWhereUniqueWithoutUserInput = {
    where: ClientWhereUniqueInput
    update: XOR<ClientUpdateWithoutUserInput, ClientUncheckedUpdateWithoutUserInput>
    create: XOR<ClientCreateWithoutUserInput, ClientUncheckedCreateWithoutUserInput>
  }

  export type ClientUpdateWithWhereUniqueWithoutUserInput = {
    where: ClientWhereUniqueInput
    data: XOR<ClientUpdateWithoutUserInput, ClientUncheckedUpdateWithoutUserInput>
  }

  export type ClientUpdateManyWithWhereWithoutUserInput = {
    where: ClientScalarWhereInput
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyWithoutUserInput>
  }

  export type ClientScalarWhereInput = {
    AND?: ClientScalarWhereInput | ClientScalarWhereInput[]
    OR?: ClientScalarWhereInput[]
    NOT?: ClientScalarWhereInput | ClientScalarWhereInput[]
    id?: StringFilter<"Client"> | string
    name?: StringFilter<"Client"> | string
    company?: StringFilter<"Client"> | string
    email?: StringNullableFilter<"Client"> | string | null
    user_id?: StringFilter<"Client"> | string
    created_at?: DateTimeFilter<"Client"> | Date | string
    updated_at?: DateTimeFilter<"Client"> | Date | string
    scraped_content?: StringNullableFilter<"Client"> | string | null
    scraped_pages?: IntNullableFilter<"Client"> | number | null
    scraped_chars?: IntNullableFilter<"Client"> | number | null
    scraped_words?: IntNullableFilter<"Client"> | number | null
    scraped_at?: DateTimeNullableFilter<"Client"> | Date | string | null
    scraped_url?: StringNullableFilter<"Client"> | string | null
  }

  export type ProjectUpsertWithWhereUniqueWithoutUserInput = {
    where: ProjectWhereUniqueInput
    update: XOR<ProjectUpdateWithoutUserInput, ProjectUncheckedUpdateWithoutUserInput>
    create: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput>
  }

  export type ProjectUpdateWithWhereUniqueWithoutUserInput = {
    where: ProjectWhereUniqueInput
    data: XOR<ProjectUpdateWithoutUserInput, ProjectUncheckedUpdateWithoutUserInput>
  }

  export type ProjectUpdateManyWithWhereWithoutUserInput = {
    where: ProjectScalarWhereInput
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyWithoutUserInput>
  }

  export type ProjectScalarWhereInput = {
    AND?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
    OR?: ProjectScalarWhereInput[]
    NOT?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
    id?: StringFilter<"Project"> | string
    client_id?: StringFilter<"Project"> | string
    title?: StringFilter<"Project"> | string
    description?: StringFilter<"Project"> | string
    documentation_urls?: StringNullableListFilter<"Project">
    prompt?: StringFilter<"Project"> | string
    status?: StringFilter<"Project"> | string
    script?: StringNullableFilter<"Project"> | string | null
    user_id?: StringFilter<"Project"> | string
    created_at?: DateTimeFilter<"Project"> | Date | string
    updated_at?: DateTimeFilter<"Project"> | Date | string
    scraped_content?: StringNullableFilter<"Project"> | string | null
    scraped_pages?: IntNullableFilter<"Project"> | number | null
    scraped_chars?: IntNullableFilter<"Project"> | number | null
    scraped_words?: IntNullableFilter<"Project"> | number | null
    scraped_at?: DateTimeNullableFilter<"Project"> | Date | string | null
    scraped_url?: StringNullableFilter<"Project"> | string | null
    video_type?: StringNullableFilter<"Project"> | string | null
  }

  export type LearningSessionUpsertWithWhereUniqueWithoutUserInput = {
    where: LearningSessionWhereUniqueInput
    update: XOR<LearningSessionUpdateWithoutUserInput, LearningSessionUncheckedUpdateWithoutUserInput>
    create: XOR<LearningSessionCreateWithoutUserInput, LearningSessionUncheckedCreateWithoutUserInput>
  }

  export type LearningSessionUpdateWithWhereUniqueWithoutUserInput = {
    where: LearningSessionWhereUniqueInput
    data: XOR<LearningSessionUpdateWithoutUserInput, LearningSessionUncheckedUpdateWithoutUserInput>
  }

  export type LearningSessionUpdateManyWithWhereWithoutUserInput = {
    where: LearningSessionScalarWhereInput
    data: XOR<LearningSessionUpdateManyMutationInput, LearningSessionUncheckedUpdateManyWithoutUserInput>
  }

  export type LearningSessionScalarWhereInput = {
    AND?: LearningSessionScalarWhereInput | LearningSessionScalarWhereInput[]
    OR?: LearningSessionScalarWhereInput[]
    NOT?: LearningSessionScalarWhereInput | LearningSessionScalarWhereInput[]
    id?: StringFilter<"LearningSession"> | string
    client_id?: StringFilter<"LearningSession"> | string
    user_id?: StringFilter<"LearningSession"> | string
    software_name?: StringFilter<"LearningSession"> | string
    documentation_summary?: StringNullableFilter<"LearningSession"> | string | null
    current_phase?: StringFilter<"LearningSession"> | string
    completion_percentage?: FloatFilter<"LearningSession"> | number
    created_at?: DateTimeFilter<"LearningSession"> | Date | string
    updated_at?: DateTimeFilter<"LearningSession"> | Date | string
  }

  export type UserCreateWithoutClientsInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    projects?: ProjectCreateNestedManyWithoutUserInput
    learning_sessions?: LearningSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutClientsInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    learning_sessions?: LearningSessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutClientsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutClientsInput, UserUncheckedCreateWithoutClientsInput>
  }

  export type ProjectCreateWithoutClientInput = {
    id?: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
    user: UserCreateNestedOneWithoutProjectsInput
  }

  export type ProjectUncheckedCreateWithoutClientInput = {
    id?: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
  }

  export type ProjectCreateOrConnectWithoutClientInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutClientInput, ProjectUncheckedCreateWithoutClientInput>
  }

  export type ProjectCreateManyClientInputEnvelope = {
    data: ProjectCreateManyClientInput | ProjectCreateManyClientInput[]
    skipDuplicates?: boolean
  }

  export type LearningSessionCreateWithoutClientInput = {
    id?: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutLearning_sessionsInput
    tasks?: LearningTaskCreateNestedManyWithoutLearning_sessionInput
    progress?: LearningProgressCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionUncheckedCreateWithoutClientInput = {
    id?: string
    user_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    tasks?: LearningTaskUncheckedCreateNestedManyWithoutLearning_sessionInput
    progress?: LearningProgressUncheckedCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageUncheckedCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionCreateOrConnectWithoutClientInput = {
    where: LearningSessionWhereUniqueInput
    create: XOR<LearningSessionCreateWithoutClientInput, LearningSessionUncheckedCreateWithoutClientInput>
  }

  export type LearningSessionCreateManyClientInputEnvelope = {
    data: LearningSessionCreateManyClientInput | LearningSessionCreateManyClientInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutClientsInput = {
    update: XOR<UserUpdateWithoutClientsInput, UserUncheckedUpdateWithoutClientsInput>
    create: XOR<UserCreateWithoutClientsInput, UserUncheckedCreateWithoutClientsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutClientsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutClientsInput, UserUncheckedUpdateWithoutClientsInput>
  }

  export type UserUpdateWithoutClientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: ProjectUpdateManyWithoutUserNestedInput
    learning_sessions?: LearningSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutClientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    learning_sessions?: LearningSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ProjectUpsertWithWhereUniqueWithoutClientInput = {
    where: ProjectWhereUniqueInput
    update: XOR<ProjectUpdateWithoutClientInput, ProjectUncheckedUpdateWithoutClientInput>
    create: XOR<ProjectCreateWithoutClientInput, ProjectUncheckedCreateWithoutClientInput>
  }

  export type ProjectUpdateWithWhereUniqueWithoutClientInput = {
    where: ProjectWhereUniqueInput
    data: XOR<ProjectUpdateWithoutClientInput, ProjectUncheckedUpdateWithoutClientInput>
  }

  export type ProjectUpdateManyWithWhereWithoutClientInput = {
    where: ProjectScalarWhereInput
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyWithoutClientInput>
  }

  export type LearningSessionUpsertWithWhereUniqueWithoutClientInput = {
    where: LearningSessionWhereUniqueInput
    update: XOR<LearningSessionUpdateWithoutClientInput, LearningSessionUncheckedUpdateWithoutClientInput>
    create: XOR<LearningSessionCreateWithoutClientInput, LearningSessionUncheckedCreateWithoutClientInput>
  }

  export type LearningSessionUpdateWithWhereUniqueWithoutClientInput = {
    where: LearningSessionWhereUniqueInput
    data: XOR<LearningSessionUpdateWithoutClientInput, LearningSessionUncheckedUpdateWithoutClientInput>
  }

  export type LearningSessionUpdateManyWithWhereWithoutClientInput = {
    where: LearningSessionScalarWhereInput
    data: XOR<LearningSessionUpdateManyMutationInput, LearningSessionUncheckedUpdateManyWithoutClientInput>
  }

  export type UserCreateWithoutProjectsInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    clients?: ClientCreateNestedManyWithoutUserInput
    learning_sessions?: LearningSessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProjectsInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    clients?: ClientUncheckedCreateNestedManyWithoutUserInput
    learning_sessions?: LearningSessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProjectsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
  }

  export type ClientCreateWithoutProjectsInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    user: UserCreateNestedOneWithoutClientsInput
    learning_sessions?: LearningSessionCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutProjectsInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    learning_sessions?: LearningSessionUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutProjectsInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutProjectsInput, ClientUncheckedCreateWithoutProjectsInput>
  }

  export type UserUpsertWithoutProjectsInput = {
    update: XOR<UserUpdateWithoutProjectsInput, UserUncheckedUpdateWithoutProjectsInput>
    create: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProjectsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProjectsInput, UserUncheckedUpdateWithoutProjectsInput>
  }

  export type UserUpdateWithoutProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    clients?: ClientUpdateManyWithoutUserNestedInput
    learning_sessions?: LearningSessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    clients?: ClientUncheckedUpdateManyWithoutUserNestedInput
    learning_sessions?: LearningSessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ClientUpsertWithoutProjectsInput = {
    update: XOR<ClientUpdateWithoutProjectsInput, ClientUncheckedUpdateWithoutProjectsInput>
    create: XOR<ClientCreateWithoutProjectsInput, ClientUncheckedCreateWithoutProjectsInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutProjectsInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutProjectsInput, ClientUncheckedUpdateWithoutProjectsInput>
  }

  export type ClientUpdateWithoutProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutClientsNestedInput
    learning_sessions?: LearningSessionUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    learning_sessions?: LearningSessionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type UserCreateWithoutLearning_sessionsInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    clients?: ClientCreateNestedManyWithoutUserInput
    projects?: ProjectCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutLearning_sessionsInput = {
    id?: string
    email: string
    password: string
    name?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    clients?: ClientUncheckedCreateNestedManyWithoutUserInput
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutLearning_sessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLearning_sessionsInput, UserUncheckedCreateWithoutLearning_sessionsInput>
  }

  export type ClientCreateWithoutLearning_sessionsInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    user: UserCreateNestedOneWithoutClientsInput
    projects?: ProjectCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutLearning_sessionsInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    projects?: ProjectUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutLearning_sessionsInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutLearning_sessionsInput, ClientUncheckedCreateWithoutLearning_sessionsInput>
  }

  export type LearningTaskCreateWithoutLearning_sessionInput = {
    id?: string
    title: string
    description: string
    instructions: string
    category: string
    difficulty_level?: number
    estimated_minutes?: number | null
    prerequisites?: LearningTaskCreateprerequisitesInput | string[]
    is_completed?: boolean
    completed_at?: Date | string | null
    user_notes?: string | null
    created_at?: Date | string
  }

  export type LearningTaskUncheckedCreateWithoutLearning_sessionInput = {
    id?: string
    title: string
    description: string
    instructions: string
    category: string
    difficulty_level?: number
    estimated_minutes?: number | null
    prerequisites?: LearningTaskCreateprerequisitesInput | string[]
    is_completed?: boolean
    completed_at?: Date | string | null
    user_notes?: string | null
    created_at?: Date | string
  }

  export type LearningTaskCreateOrConnectWithoutLearning_sessionInput = {
    where: LearningTaskWhereUniqueInput
    create: XOR<LearningTaskCreateWithoutLearning_sessionInput, LearningTaskUncheckedCreateWithoutLearning_sessionInput>
  }

  export type LearningTaskCreateManyLearning_sessionInputEnvelope = {
    data: LearningTaskCreateManyLearning_sessionInput | LearningTaskCreateManyLearning_sessionInput[]
    skipDuplicates?: boolean
  }

  export type LearningProgressCreateWithoutLearning_sessionInput = {
    id?: string
    category: string
    mastery_level?: number
    tasks_completed?: number
    total_tasks?: number
    last_activity?: Date | string
  }

  export type LearningProgressUncheckedCreateWithoutLearning_sessionInput = {
    id?: string
    category: string
    mastery_level?: number
    tasks_completed?: number
    total_tasks?: number
    last_activity?: Date | string
  }

  export type LearningProgressCreateOrConnectWithoutLearning_sessionInput = {
    where: LearningProgressWhereUniqueInput
    create: XOR<LearningProgressCreateWithoutLearning_sessionInput, LearningProgressUncheckedCreateWithoutLearning_sessionInput>
  }

  export type LearningProgressCreateManyLearning_sessionInputEnvelope = {
    data: LearningProgressCreateManyLearning_sessionInput | LearningProgressCreateManyLearning_sessionInput[]
    skipDuplicates?: boolean
  }

  export type LearningChatMessageCreateWithoutLearning_sessionInput = {
    id?: string
    role: string
    content: string
    message_type?: string
    created_at?: Date | string
  }

  export type LearningChatMessageUncheckedCreateWithoutLearning_sessionInput = {
    id?: string
    role: string
    content: string
    message_type?: string
    created_at?: Date | string
  }

  export type LearningChatMessageCreateOrConnectWithoutLearning_sessionInput = {
    where: LearningChatMessageWhereUniqueInput
    create: XOR<LearningChatMessageCreateWithoutLearning_sessionInput, LearningChatMessageUncheckedCreateWithoutLearning_sessionInput>
  }

  export type LearningChatMessageCreateManyLearning_sessionInputEnvelope = {
    data: LearningChatMessageCreateManyLearning_sessionInput | LearningChatMessageCreateManyLearning_sessionInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutLearning_sessionsInput = {
    update: XOR<UserUpdateWithoutLearning_sessionsInput, UserUncheckedUpdateWithoutLearning_sessionsInput>
    create: XOR<UserCreateWithoutLearning_sessionsInput, UserUncheckedCreateWithoutLearning_sessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLearning_sessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLearning_sessionsInput, UserUncheckedUpdateWithoutLearning_sessionsInput>
  }

  export type UserUpdateWithoutLearning_sessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    clients?: ClientUpdateManyWithoutUserNestedInput
    projects?: ProjectUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutLearning_sessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    clients?: ClientUncheckedUpdateManyWithoutUserNestedInput
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ClientUpsertWithoutLearning_sessionsInput = {
    update: XOR<ClientUpdateWithoutLearning_sessionsInput, ClientUncheckedUpdateWithoutLearning_sessionsInput>
    create: XOR<ClientCreateWithoutLearning_sessionsInput, ClientUncheckedCreateWithoutLearning_sessionsInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutLearning_sessionsInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutLearning_sessionsInput, ClientUncheckedUpdateWithoutLearning_sessionsInput>
  }

  export type ClientUpdateWithoutLearning_sessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutClientsNestedInput
    projects?: ProjectUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutLearning_sessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUncheckedUpdateManyWithoutClientNestedInput
  }

  export type LearningTaskUpsertWithWhereUniqueWithoutLearning_sessionInput = {
    where: LearningTaskWhereUniqueInput
    update: XOR<LearningTaskUpdateWithoutLearning_sessionInput, LearningTaskUncheckedUpdateWithoutLearning_sessionInput>
    create: XOR<LearningTaskCreateWithoutLearning_sessionInput, LearningTaskUncheckedCreateWithoutLearning_sessionInput>
  }

  export type LearningTaskUpdateWithWhereUniqueWithoutLearning_sessionInput = {
    where: LearningTaskWhereUniqueInput
    data: XOR<LearningTaskUpdateWithoutLearning_sessionInput, LearningTaskUncheckedUpdateWithoutLearning_sessionInput>
  }

  export type LearningTaskUpdateManyWithWhereWithoutLearning_sessionInput = {
    where: LearningTaskScalarWhereInput
    data: XOR<LearningTaskUpdateManyMutationInput, LearningTaskUncheckedUpdateManyWithoutLearning_sessionInput>
  }

  export type LearningTaskScalarWhereInput = {
    AND?: LearningTaskScalarWhereInput | LearningTaskScalarWhereInput[]
    OR?: LearningTaskScalarWhereInput[]
    NOT?: LearningTaskScalarWhereInput | LearningTaskScalarWhereInput[]
    id?: StringFilter<"LearningTask"> | string
    learning_session_id?: StringFilter<"LearningTask"> | string
    title?: StringFilter<"LearningTask"> | string
    description?: StringFilter<"LearningTask"> | string
    instructions?: StringFilter<"LearningTask"> | string
    category?: StringFilter<"LearningTask"> | string
    difficulty_level?: IntFilter<"LearningTask"> | number
    estimated_minutes?: IntNullableFilter<"LearningTask"> | number | null
    prerequisites?: StringNullableListFilter<"LearningTask">
    is_completed?: BoolFilter<"LearningTask"> | boolean
    completed_at?: DateTimeNullableFilter<"LearningTask"> | Date | string | null
    user_notes?: StringNullableFilter<"LearningTask"> | string | null
    created_at?: DateTimeFilter<"LearningTask"> | Date | string
  }

  export type LearningProgressUpsertWithWhereUniqueWithoutLearning_sessionInput = {
    where: LearningProgressWhereUniqueInput
    update: XOR<LearningProgressUpdateWithoutLearning_sessionInput, LearningProgressUncheckedUpdateWithoutLearning_sessionInput>
    create: XOR<LearningProgressCreateWithoutLearning_sessionInput, LearningProgressUncheckedCreateWithoutLearning_sessionInput>
  }

  export type LearningProgressUpdateWithWhereUniqueWithoutLearning_sessionInput = {
    where: LearningProgressWhereUniqueInput
    data: XOR<LearningProgressUpdateWithoutLearning_sessionInput, LearningProgressUncheckedUpdateWithoutLearning_sessionInput>
  }

  export type LearningProgressUpdateManyWithWhereWithoutLearning_sessionInput = {
    where: LearningProgressScalarWhereInput
    data: XOR<LearningProgressUpdateManyMutationInput, LearningProgressUncheckedUpdateManyWithoutLearning_sessionInput>
  }

  export type LearningProgressScalarWhereInput = {
    AND?: LearningProgressScalarWhereInput | LearningProgressScalarWhereInput[]
    OR?: LearningProgressScalarWhereInput[]
    NOT?: LearningProgressScalarWhereInput | LearningProgressScalarWhereInput[]
    id?: StringFilter<"LearningProgress"> | string
    learning_session_id?: StringFilter<"LearningProgress"> | string
    category?: StringFilter<"LearningProgress"> | string
    mastery_level?: FloatFilter<"LearningProgress"> | number
    tasks_completed?: IntFilter<"LearningProgress"> | number
    total_tasks?: IntFilter<"LearningProgress"> | number
    last_activity?: DateTimeFilter<"LearningProgress"> | Date | string
  }

  export type LearningChatMessageUpsertWithWhereUniqueWithoutLearning_sessionInput = {
    where: LearningChatMessageWhereUniqueInput
    update: XOR<LearningChatMessageUpdateWithoutLearning_sessionInput, LearningChatMessageUncheckedUpdateWithoutLearning_sessionInput>
    create: XOR<LearningChatMessageCreateWithoutLearning_sessionInput, LearningChatMessageUncheckedCreateWithoutLearning_sessionInput>
  }

  export type LearningChatMessageUpdateWithWhereUniqueWithoutLearning_sessionInput = {
    where: LearningChatMessageWhereUniqueInput
    data: XOR<LearningChatMessageUpdateWithoutLearning_sessionInput, LearningChatMessageUncheckedUpdateWithoutLearning_sessionInput>
  }

  export type LearningChatMessageUpdateManyWithWhereWithoutLearning_sessionInput = {
    where: LearningChatMessageScalarWhereInput
    data: XOR<LearningChatMessageUpdateManyMutationInput, LearningChatMessageUncheckedUpdateManyWithoutLearning_sessionInput>
  }

  export type LearningChatMessageScalarWhereInput = {
    AND?: LearningChatMessageScalarWhereInput | LearningChatMessageScalarWhereInput[]
    OR?: LearningChatMessageScalarWhereInput[]
    NOT?: LearningChatMessageScalarWhereInput | LearningChatMessageScalarWhereInput[]
    id?: StringFilter<"LearningChatMessage"> | string
    learning_session_id?: StringFilter<"LearningChatMessage"> | string
    role?: StringFilter<"LearningChatMessage"> | string
    content?: StringFilter<"LearningChatMessage"> | string
    message_type?: StringFilter<"LearningChatMessage"> | string
    created_at?: DateTimeFilter<"LearningChatMessage"> | Date | string
  }

  export type LearningSessionCreateWithoutTasksInput = {
    id?: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutLearning_sessionsInput
    client: ClientCreateNestedOneWithoutLearning_sessionsInput
    progress?: LearningProgressCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionUncheckedCreateWithoutTasksInput = {
    id?: string
    client_id: string
    user_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    progress?: LearningProgressUncheckedCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageUncheckedCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionCreateOrConnectWithoutTasksInput = {
    where: LearningSessionWhereUniqueInput
    create: XOR<LearningSessionCreateWithoutTasksInput, LearningSessionUncheckedCreateWithoutTasksInput>
  }

  export type LearningSessionUpsertWithoutTasksInput = {
    update: XOR<LearningSessionUpdateWithoutTasksInput, LearningSessionUncheckedUpdateWithoutTasksInput>
    create: XOR<LearningSessionCreateWithoutTasksInput, LearningSessionUncheckedCreateWithoutTasksInput>
    where?: LearningSessionWhereInput
  }

  export type LearningSessionUpdateToOneWithWhereWithoutTasksInput = {
    where?: LearningSessionWhereInput
    data: XOR<LearningSessionUpdateWithoutTasksInput, LearningSessionUncheckedUpdateWithoutTasksInput>
  }

  export type LearningSessionUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLearning_sessionsNestedInput
    client?: ClientUpdateOneRequiredWithoutLearning_sessionsNestedInput
    progress?: LearningProgressUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: LearningProgressUncheckedUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUncheckedUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionCreateWithoutProgressInput = {
    id?: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutLearning_sessionsInput
    client: ClientCreateNestedOneWithoutLearning_sessionsInput
    tasks?: LearningTaskCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionUncheckedCreateWithoutProgressInput = {
    id?: string
    client_id: string
    user_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    tasks?: LearningTaskUncheckedCreateNestedManyWithoutLearning_sessionInput
    chat_messages?: LearningChatMessageUncheckedCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionCreateOrConnectWithoutProgressInput = {
    where: LearningSessionWhereUniqueInput
    create: XOR<LearningSessionCreateWithoutProgressInput, LearningSessionUncheckedCreateWithoutProgressInput>
  }

  export type LearningSessionUpsertWithoutProgressInput = {
    update: XOR<LearningSessionUpdateWithoutProgressInput, LearningSessionUncheckedUpdateWithoutProgressInput>
    create: XOR<LearningSessionCreateWithoutProgressInput, LearningSessionUncheckedCreateWithoutProgressInput>
    where?: LearningSessionWhereInput
  }

  export type LearningSessionUpdateToOneWithWhereWithoutProgressInput = {
    where?: LearningSessionWhereInput
    data: XOR<LearningSessionUpdateWithoutProgressInput, LearningSessionUncheckedUpdateWithoutProgressInput>
  }

  export type LearningSessionUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLearning_sessionsNestedInput
    client?: ClientUpdateOneRequiredWithoutLearning_sessionsNestedInput
    tasks?: LearningTaskUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionUncheckedUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: LearningTaskUncheckedUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUncheckedUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionCreateWithoutChat_messagesInput = {
    id?: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutLearning_sessionsInput
    client: ClientCreateNestedOneWithoutLearning_sessionsInput
    tasks?: LearningTaskCreateNestedManyWithoutLearning_sessionInput
    progress?: LearningProgressCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionUncheckedCreateWithoutChat_messagesInput = {
    id?: string
    client_id: string
    user_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
    tasks?: LearningTaskUncheckedCreateNestedManyWithoutLearning_sessionInput
    progress?: LearningProgressUncheckedCreateNestedManyWithoutLearning_sessionInput
  }

  export type LearningSessionCreateOrConnectWithoutChat_messagesInput = {
    where: LearningSessionWhereUniqueInput
    create: XOR<LearningSessionCreateWithoutChat_messagesInput, LearningSessionUncheckedCreateWithoutChat_messagesInput>
  }

  export type LearningSessionUpsertWithoutChat_messagesInput = {
    update: XOR<LearningSessionUpdateWithoutChat_messagesInput, LearningSessionUncheckedUpdateWithoutChat_messagesInput>
    create: XOR<LearningSessionCreateWithoutChat_messagesInput, LearningSessionUncheckedCreateWithoutChat_messagesInput>
    where?: LearningSessionWhereInput
  }

  export type LearningSessionUpdateToOneWithWhereWithoutChat_messagesInput = {
    where?: LearningSessionWhereInput
    data: XOR<LearningSessionUpdateWithoutChat_messagesInput, LearningSessionUncheckedUpdateWithoutChat_messagesInput>
  }

  export type LearningSessionUpdateWithoutChat_messagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLearning_sessionsNestedInput
    client?: ClientUpdateOneRequiredWithoutLearning_sessionsNestedInput
    tasks?: LearningTaskUpdateManyWithoutLearning_sessionNestedInput
    progress?: LearningProgressUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionUncheckedUpdateWithoutChat_messagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: LearningTaskUncheckedUpdateManyWithoutLearning_sessionNestedInput
    progress?: LearningProgressUncheckedUpdateManyWithoutLearning_sessionNestedInput
  }

  export type ClientCreateManyUserInput = {
    id?: string
    name: string
    company: string
    email?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
  }

  export type ProjectCreateManyUserInput = {
    id?: string
    client_id: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
  }

  export type LearningSessionCreateManyUserInput = {
    id?: string
    client_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ClientUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUpdateManyWithoutClientNestedInput
    learning_sessions?: LearningSessionUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUncheckedUpdateManyWithoutClientNestedInput
    learning_sessions?: LearningSessionUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProjectUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
    client?: ClientUpdateOneRequiredWithoutProjectsNestedInput
  }

  export type ProjectUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProjectUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LearningSessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    client?: ClientUpdateOneRequiredWithoutLearning_sessionsNestedInput
    tasks?: LearningTaskUpdateManyWithoutLearning_sessionNestedInput
    progress?: LearningProgressUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: LearningTaskUncheckedUpdateManyWithoutLearning_sessionNestedInput
    progress?: LearningProgressUncheckedUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUncheckedUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    client_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectCreateManyClientInput = {
    id?: string
    title: string
    description: string
    documentation_urls?: ProjectCreatedocumentation_urlsInput | string[]
    prompt: string
    status: string
    script?: string | null
    user_id: string
    created_at?: Date | string
    updated_at?: Date | string
    scraped_content?: string | null
    scraped_pages?: number | null
    scraped_chars?: number | null
    scraped_words?: number | null
    scraped_at?: Date | string | null
    scraped_url?: string | null
    video_type?: string | null
  }

  export type LearningSessionCreateManyClientInput = {
    id?: string
    user_id: string
    software_name: string
    documentation_summary?: string | null
    current_phase?: string
    completion_percentage?: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProjectUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutProjectsNestedInput
  }

  export type ProjectUncheckedUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProjectUncheckedUpdateManyWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    documentation_urls?: ProjectUpdatedocumentation_urlsInput | string[]
    prompt?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    script?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    scraped_content?: NullableStringFieldUpdateOperationsInput | string | null
    scraped_pages?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_chars?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_words?: NullableIntFieldUpdateOperationsInput | number | null
    scraped_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scraped_url?: NullableStringFieldUpdateOperationsInput | string | null
    video_type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LearningSessionUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLearning_sessionsNestedInput
    tasks?: LearningTaskUpdateManyWithoutLearning_sessionNestedInput
    progress?: LearningProgressUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionUncheckedUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: LearningTaskUncheckedUpdateManyWithoutLearning_sessionNestedInput
    progress?: LearningProgressUncheckedUpdateManyWithoutLearning_sessionNestedInput
    chat_messages?: LearningChatMessageUncheckedUpdateManyWithoutLearning_sessionNestedInput
  }

  export type LearningSessionUncheckedUpdateManyWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    software_name?: StringFieldUpdateOperationsInput | string
    documentation_summary?: NullableStringFieldUpdateOperationsInput | string | null
    current_phase?: StringFieldUpdateOperationsInput | string
    completion_percentage?: FloatFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningTaskCreateManyLearning_sessionInput = {
    id?: string
    title: string
    description: string
    instructions: string
    category: string
    difficulty_level?: number
    estimated_minutes?: number | null
    prerequisites?: LearningTaskCreateprerequisitesInput | string[]
    is_completed?: boolean
    completed_at?: Date | string | null
    user_notes?: string | null
    created_at?: Date | string
  }

  export type LearningProgressCreateManyLearning_sessionInput = {
    id?: string
    category: string
    mastery_level?: number
    tasks_completed?: number
    total_tasks?: number
    last_activity?: Date | string
  }

  export type LearningChatMessageCreateManyLearning_sessionInput = {
    id?: string
    role: string
    content: string
    message_type?: string
    created_at?: Date | string
  }

  export type LearningTaskUpdateWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    instructions?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    difficulty_level?: IntFieldUpdateOperationsInput | number
    estimated_minutes?: NullableIntFieldUpdateOperationsInput | number | null
    prerequisites?: LearningTaskUpdateprerequisitesInput | string[]
    is_completed?: BoolFieldUpdateOperationsInput | boolean
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningTaskUncheckedUpdateWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    instructions?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    difficulty_level?: IntFieldUpdateOperationsInput | number
    estimated_minutes?: NullableIntFieldUpdateOperationsInput | number | null
    prerequisites?: LearningTaskUpdateprerequisitesInput | string[]
    is_completed?: BoolFieldUpdateOperationsInput | boolean
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningTaskUncheckedUpdateManyWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    instructions?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    difficulty_level?: IntFieldUpdateOperationsInput | number
    estimated_minutes?: NullableIntFieldUpdateOperationsInput | number | null
    prerequisites?: LearningTaskUpdateprerequisitesInput | string[]
    is_completed?: BoolFieldUpdateOperationsInput | boolean
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user_notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningProgressUpdateWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    mastery_level?: FloatFieldUpdateOperationsInput | number
    tasks_completed?: IntFieldUpdateOperationsInput | number
    total_tasks?: IntFieldUpdateOperationsInput | number
    last_activity?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningProgressUncheckedUpdateWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    mastery_level?: FloatFieldUpdateOperationsInput | number
    tasks_completed?: IntFieldUpdateOperationsInput | number
    total_tasks?: IntFieldUpdateOperationsInput | number
    last_activity?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningProgressUncheckedUpdateManyWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    mastery_level?: FloatFieldUpdateOperationsInput | number
    tasks_completed?: IntFieldUpdateOperationsInput | number
    total_tasks?: IntFieldUpdateOperationsInput | number
    last_activity?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningChatMessageUpdateWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    message_type?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningChatMessageUncheckedUpdateWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    message_type?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LearningChatMessageUncheckedUpdateManyWithoutLearning_sessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    message_type?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}