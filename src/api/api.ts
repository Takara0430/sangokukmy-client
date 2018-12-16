import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import Enumerable from 'linq';
import * as current from '../common/current';
import * as def from '../common/definitions';

/**
 * エラーコード
 */
export enum ErrorCode {
  serverConnectionFailed = -1,
  succeed = 32767,
  internalError = 1,
  databaseError = 2,
  databaseTimeout = 3,
  lockFailed = 4,
  loginCharacterNotFound = 5,
  loginParameterMissing = 6,
  loginParameterIncorrect = 7,
  loginTokenIncorrect = 8,
}

/**
 * APIデータ
 */
export class ApiData<T> {
  public constructor(public type: number,
                     public data: T) {}
}

/**
 * 月日・時刻
 */
export class DateTime {
  public static readonly typeId = 1;

  public constructor(public year: number = 0,
                     public month: number = 0,
                     public day: number = 0,
                     public hours: number = 0,
                     public minutes: number = 0,
                     public seconds: number = 0) {}
}

/**
 * ゲーム内の月日
 */
export class GameDateTime {
  public static readonly typeId = 12;

  public constructor(public year: number = 0,
                     public month: number = 0) {}
}

/**
 * エラー
 */
export class ApiError {
  public static readonly typeId = 7;
  public static readonly serverConnectionFailed = new ApiError(ErrorCode.serverConnectionFailed);

  public constructor(public code: number,
                     public data?: any) {}
}

/**
 * マップログの種類
 */
export class MapLogType {
  public static readonly typeId = 2;

  /**
   * 空のタイプ
   */
  public static empty = new MapLogType(-1, '', 'black');

  constructor(public id: number,
              public text: string,
              public color: string) {}
}

/**
 * デフォルトのマップログの種類
 */
export class MapLogTypes {

  /**
   * IDからログタイプを取得する
   * @param id ログタイプのID
   * @returns 指定したIDにあったログタイプ
   */
  public static fromId(id: number): MapLogType | null {
    const type = Enumerable.from(this.types).singleOrDefault((t) => t.id === id);
    return type || null;
  }

  private static types = [
    new MapLogType(1, 'イベント', 'red'),
  ];

  private constructor() {}

}

/**
 * マップログ
 */
export class MapLog {
  public static readonly typeId = 4;

  constructor(public id: number,
              public message: string,
              public type: MapLogType,
              public date: DateTime) {}
}

/**
 * 武将更新ログ
 */
export class CharacterUpdateLog {
  public static readonly typeId = 3;

  constructor(public id: number,
              public characterName: string,
              public date: DateTime) {}
}

/**
 * 認証データ
 */
export class AuthenticationData {
  public static readonly typeId = 6;

  constructor(public accessToken: string,
              public characterId: number,
              public expirationTime: DateTime) {}
}

/**
 * 武将
 */
export class Character {
  public static readonly typeId = 9;

  public constructor(public id: number = 0,
                     public aliasId: string = '',
                     public name: string = '',
                     public countryId: number = 0,
                     public strong: number = 0,
                     public strongEx: number = 0,
                     public intellect: number = 0,
                     public intellectEx: number = 0,
                     public leadership: number = 0,
                     public leadershipEx: number = 0,
                     public popularity: number = 0,
                     public popularityEx: number = 0,
                     public soldierType: number = 0,
                     public soldierNumber: number = 0,
                     public proficiency: number = 0,
                     public money: number = 0,
                     public rice: number = 0,
                     public contribution: number = 0,
                     public classValue: number = 0,
                     public deleteTurn: number = 0,
                     public townId: number = 0,
                     public message: number = 0,
                     public lastUpdated: DateTime = new DateTime()) {}
}

/**
 * 国
 */
export class Country {
  public static readonly typeId = 10;

  public constructor(public id: number = 0,
                     public name: string = '',
                     public colorId: number = 0,
                     public established: GameDateTime = new GameDateTime(),
                     public capitalTownId: number = 0) {}
}

/**
 * 都市
 */
export class Town {
  public static readonly typeId = 11;

  public static readonly typeAgriculture = 1;
  public static readonly typeCommercial = 2;
  public static readonly typeFortress = 3;
  public static readonly typeLarge = 4;

  public constructor(public id: number = 0,
                     public type: number = 0,
                     public countryId: number = 0,
                     public name: string = '',
                     public x: number = 0,
                     public y: number = 0,
                     public people: number = 0,
                     public agriculture: number = 0,
                     public agricultureMax: number = 0,
                     public commercial: number = 0,
                     public commercialMax: number = 0,
                     public technology: number = 0,
                     public technologyMax: number = 0,
                     public wall: number = 0,
                     public wallMax: number = 0,
                     public wallguard: number = 0,
                     public wallguardMax: number = 0,
                     public security: number = 0,
                     public ricePrice: number = 0) {}
}

export class Api {

  /**
   * IDとパスワードでログインする
   * @param id ID
   * @param password パスワード
   */
  public static async loginWithIdAndPassword(id: string, password: string): Promise<AuthenticationData> {
    try {
      const result = await axios.post<ApiData<AuthenticationData>>(def.API_HOST + 'authenticate', {
        id,
        password,
      });
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 武将更新ログを取得する
   *
   * GET    /api/v1/character/updatelog/{count}
   * @param count 取得する数
   * @returns ログの配列。countに入り切らなかった場合は、空の要素が入れられる
   */
  public static async getCharacterLogs(count: number): Promise<CharacterUpdateLog[]> {
    // dummy
    const result = new Array<CharacterUpdateLog>();
    for (let i = 0; i < count; i++) {
      result.push(new CharacterUpdateLog(i + 1, 'あすか', new DateTime(2018, 1, 1, 12, 0, 0)));
    }
    return result;
  }

//#region マップログ

  /**
   * マップログを取得する
   *
   * GET    /api/v1/maplog/{count}
   * @param count 取得する数
   * @returns マップログの配列。countに入り切らなかった場合は、空の要素が入れられる
   */
  public static async getMapLogs(count: number): Promise<MapLog[]> {
    // dummy
    const result = new Array<MapLog>();
    for (let i = 0; i < count; i++) {
      result.push(new MapLog(i + 1,
        'てすとろぐ',
        MapLogTypes.fromId(1) || MapLogType.empty,
        new DateTime(2018, 1, 1, 12, 0, 0)));
    }
    return result;
  }

  /*
   * マップログ（太字）を取得する
   *
   * GET    /api/v1/maplog/important/{count}
   */
  public static async getImportantMapLogs(count: number): Promise<MapLog[]> {
    // dummy
    const result = new Array<MapLog>();
    for (let i = 0; i < count; i++) {
      result.push(new MapLog(i + 1,
        'てすとろぐ（太字）',
        MapLogTypes.fromId(1) || MapLogType.empty,
        new DateTime(2018, 1, 1, 12, 0, 0)));
    }
    return result;
  }

//#endregion

  /**
   * 認証のときに利用するヘッダ
   */
  private static get authHeader(): AxiosRequestConfig {
    return {
      headers: {
        Authorization: current.authorizationToken,
      },
    };
  }

  private static pickException(ex: any) {
    if (ex.response) {
      return ex.response.data;
    } else {
      return { data: ApiError.serverConnectionFailed };
    }
  }

}
