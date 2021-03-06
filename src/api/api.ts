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
  loginTokenEmpty = 9,
  internalDataNotFound = 10,
  commandTypeNotFound = 11,
  operationConflict = 12,
  debugModeOnlyError = 13,
  characterIconNotFoundError = 14,
  lackOfTownTechnologyForSoldier = 15,
  lackOfCommandParameter = 16,
  invalidCommandParameter = 17,
  notPermissionError = 18,
  townNotFoundError = 19,
  meaninglessOperationError = 20,
  characterNotFoundError = 21,
  countryNotFoundError = 22,
  invalidParameterError = 23,
  lackOfParameterError = 24,
  lackOfNameParameterError = 25,
  invalidOperationError = 26,
  unitNotFoundError = 27,
  unitJoinLimitedError = 28,
  parentNodeNotFoundError = 29,
  notTopNodeError = 30,
  nodeNotFoundError = 31,
  numberRangeError = 32,
  stringLengthError = 33,
  cantPublisAtSuchTownhError = 34,
  cantJoinAtSuchTownhError = 35,
  cantJoinAtSuchCountryhError = 36,
  duplicateCharacterNameOrAliasIdError = 37,
  duplicateCountryNameOrColorError = 38,
  invalidIpAddressError = 39,
  duplicateEntryError = 40,
  invitationCodeRequestedError = 41,
}

/**
 * IDをもった要素
 */
export interface IIdentitiedEntity {
  id: number;
}

/**
 * APIデータ
 */
export class ApiData<T> {
  public constructor(public type: number,
                     public data: T) {}
}

/**
 * API配列データ
 */
export class ApiArrayData<T> {
  public constructor(public type: number,
                     public data: T[]) {}
}

/**
 * サーバからのシグナル
 */
export class ApiSignal {
  public static readonly typeId: number = 15;

  public constructor(public type: number = 0,
                     public data?: any) {}
}

/**
 * 月日・時刻
 */
export class DateTime {
  public static readonly typeId = 1;

  public static toFormatedString(date: DateTime): string {
    if (date !== undefined) {
      return date.year + '年' +
      date.month + '月' +
      date.day + '日 ' +
      date.hours + ':' +
      (date.minutes < 10 ? '0' : '') + date.minutes + ':' +
      (date.seconds < 10 ? '0' : '') + date.seconds;
    } else {
      return '???';
    }
  }

  public static toShortFormatedString(date: DateTime): string {
    if (date !== undefined) {
      return date.day + '日 ' +
      date.hours + ':' +
      (date.minutes < 10 ? '0' : '') + date.minutes;
    } else {
      return '???';
    }
  }

  public static toDate(date: DateTime): Date {
    return new Date(date.year, date.month - 1, date.day, date.hours, date.minutes, date.seconds);
  }

  public static fromDate(date: Date): DateTime {
    return new DateTime(date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds());
  }

  public constructor(public year: number = 0,
                     public month: number = 0,
                     public day: number = 0,
                     public hours: number = 0,
                     public minutes: number = 0,
                     public seconds: number = 0) {}

  public toString(): string {
    return DateTime.toFormatedString(this);
  }
}

/**
 * ゲーム内の月日
 */
export class GameDateTime {
  public static readonly typeId = 12;

  public static toFormatedString(date: GameDateTime): string {
    return date.year + '年' + date.month + '月';
  }

  public static toNumber(date: GameDateTime): number {
    return date.year * 12 + date.month - 1;
  }

  public static fromNumber(num: number): GameDateTime {
    return new GameDateTime(Math.floor(num / 12), num % 12 + 1);
  }

  public static toRealDate(date: GameDateTime): DateTime {
    // TODO
    return new DateTime(2018, 12, 1, 20, 0, 0);
  }

  public static addMonth(date: GameDateTime, add: number): GameDateTime {
    let year = date.year;
    let month = date.month + add;
    while (month > 12) {
      month -= 12;
      year++;
    }
    while (month < 1) {
      month += 12;
      year--;
    }
    return new GameDateTime(year, month);
  }

  public static nextMonth(date: GameDateTime): GameDateTime {
    return GameDateTime.addMonth(date, 1);
  }

  public constructor(public year: number = 0,
                     public month: number = 0) {}

  public toString(): string {
    return GameDateTime.toFormatedString(this);
  }
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
 * システムデータ
 */
export class SystemData {
  public static readonly typeId = 19;

  public constructor(public isDebug: boolean = false,
                     public period: number = 0,
                     public betaVersion: number = 0,
                     public gameDateTime: GameDateTime = new GameDateTime(0, 0),
                     public currentMonthStartDateTime: DateTime = new DateTime(0, 0, 0, 0, 0, 0),
                     public isWaitingReset: boolean = false,
                     public resetGameDateTime: GameDateTime = new GameDateTime(0, 0),
                     public invitationCodeRequestedAtEntry: boolean = false) {}
}

/**
 * マップログ
 */
export class MapLog implements IIdentitiedEntity {
  public static readonly typeId = 4;

  public static getEventType(log: MapLog): def.EventType | undefined {
    return Enumerable.from(def.EVENT_TYPES).firstOrDefault((et) => et.id === log.eventType);
  }

  constructor(public id: number = 0,
              public isImportant: boolean = false,
              public eventType: number = 0,
              public message: string = '',
              public gameDate: GameDateTime = new GameDateTime(),
              public date: DateTime = new DateTime(),
              public battleLogId: number = 0) {}
}

/**
 * 武将更新ログ
 */
export class CharacterUpdateLog implements IIdentitiedEntity {
  public static readonly typeId = 25;

  constructor(public id: number,
              public characterName: string,
              public date: DateTime,
              public gameDate: GameDateTime,
              public isFirstAtMonth: boolean) {}
}

export class CharacterSoldierType {
  public static readonly typeId = 31;

  public static readonly statusInDraft = 0;
  public static readonly statusResearching = 1;
  public static readonly statusAvailable = 2;
  public static readonly statusRemoved = 3;

  public static sumOfNumbers(type: CharacterSoldierType): number {
    return type.commonSoldier + type.lightInfantory + type.archer +
      type.lightCavalry + type.strongCrossbow + type.lightIntellect +
      type.heavyInfantory + type.heavyCavalry + type.intellect +
      type.repeatingCrossbow + type.strongGuards + type.seiran;
  }

  public static isVerify(type: CharacterSoldierType): boolean {
    return type.commonSoldier >= 0 && type.lightInfantory >= 0 && type.archer >= 0 &&
      type.lightCavalry >= 0 && type.strongCrossbow >= 0 && type.lightIntellect >= 0 &&
      type.heavyInfantory >= 0 && type.heavyCavalry >= 0 && type.intellect >= 0 &&
      type.repeatingCrossbow >= 0 && type.strongGuards >= 0 && type.seiran >= 0;
  }

  public static getParts(type: CharacterSoldierType): def.SoldierType[] {
    const types = Enumerable.from(def.SOLDIER_TYPES);
    return Enumerable.repeat(types.first((t) => t.id === 1), type.commonSoldier)
      .concat(Enumerable.repeat(types.first((t) => t.id === 3), type.lightInfantory))
      .concat(Enumerable.repeat(types.first((t) => t.id === 4), type.archer))
      .concat(Enumerable.repeat(types.first((t) => t.id === 5), type.lightCavalry))
      .concat(Enumerable.repeat(types.first((t) => t.id === 6), type.strongCrossbow))
      .concat(Enumerable.repeat(types.first((t) => t.id === 7), type.lightIntellect))
      .concat(Enumerable.repeat(types.first((t) => t.id === 8), type.heavyInfantory))
      .concat(Enumerable.repeat(types.first((t) => t.id === 9), type.heavyCavalry))
      .concat(Enumerable.repeat(types.first((t) => t.id === 10), type.intellect))
      .concat(Enumerable.repeat(types.first((t) => t.id === 11), type.repeatingCrossbow))
      .concat(Enumerable.repeat(types.first((t) => t.id === 12), type.strongGuards))
      .concat(Enumerable.repeat(types.first((t) => t.id === 14), type.seiran))
      .toArray();
  }

  public static getMoney(type: CharacterSoldierType): number {
    const parts = Enumerable
      .from(CharacterSoldierType.getParts(type));
    if (parts.count() <= 0) {
      return 0;
    }
    return parts.sum((p) => p.money);
  }

  public static getTechnology(type: CharacterSoldierType): number {
    const parts = Enumerable
      .from(CharacterSoldierType.getParts(type));
    if (parts.count() <= 0) {
      return 0;
    }
    return parts.max((p) => p.technology);
  }

  public static getDescription(type: CharacterSoldierType): string {
    const parts = Enumerable
      .from(CharacterSoldierType.getParts(type));
    if (parts.count() <= 0) {
      return '（なし）';
    }
    return parts.groupBy((t) => t.name).select((t) => t.key() + t.count().toString()).toArray().join(' + ');
  }

  public static getResearchMoney(type: CharacterSoldierType, buildingSize: number): number {
    const money = this.getMoney(type);
    if (buildingSize <= 0) {
      return -1;
    } else {
      return Math.floor(money * 160 / buildingSize);
    }
  }

  public static getResearchCost(type: CharacterSoldierType, buildingSize: number): number {
    const money = this.getMoney(type);
    const technology = this.getTechnology(type);
    if (buildingSize <= 0) {
      return -1;
    } else {
      return Math.floor(money * (technology / 230) / buildingSize);
    }
  }

  constructor(public id: number = 0,
              public status: number = 0,
              public name: string = '',
              public ricePerTurn: number = 0,
              public researchCost: number = 0,
              public commonSoldier: number = 0,
              public lightInfantory: number = 0,
              public archer: number = 0,
              public lightCavalry: number = 0,
              public strongCrossbow: number = 0,
              public lightIntellect: number = 0,
              public heavyInfantory: number = 0,
              public heavyCavalry: number = 0,
              public intellect: number = 0,
              public repeatingCrossbow: number = 0,
              public strongGuards: number = 0,
              public seiran: number = 0) {}
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
export class Character implements IIdentitiedEntity {
  public static readonly typeId = 9;

  public static readonly aiHuman = 0;
  public static readonly aiSecretaryPatroller = 8;
  public static readonly aiSecretaryUnitGather = 9;

  public static getClassName(chara: Character): string {
    const lank = Math.min(Math.floor(chara.classValue / def.NEXT_LANK), def.CLASS_NAMES.length - 1);
    return def.CLASS_NAMES[lank];
  }

  public constructor(public id: number = 0,
                     public aliasId: string = '',
                     public name: string = '',
                     public countryId: number = 0,
                     public aiType: number = 0,
                     public strong: number = 0,
                     public strongEx: number = 0,
                     public intellect: number = 0,
                     public intellectEx: number = 0,
                     public leadership: number = 0,
                     public leadershipEx: number = 0,
                     public popularity: number = 0,
                     public popularityEx: number = 0,
                     public soldierType: number = 0,
                     public characterSoldierTypeId: number = 0,
                     public soldierNumber: number = 0,
                     public proficiency: number = 0,
                     public money: number = 0,
                     public rice: number = 0,
                     public contribution: number = 0,
                     public classValue: number = 0,
                     public deleteTurn: number = 0,
                     public townId: number = 0,
                     public message: string = '',
                     public lastUpdated: DateTime = new DateTime(),
                     public lastUpdatedGameDate: GameDateTime = new GameDateTime(),
                     public characterSoldierType?: CharacterSoldierType,
                     public commands?: CharacterCommand[],
                     public mainIcon?: CharacterIcon,
                     public reinforcement?: Reinforcement) {}
}

/**
 * 国のポスト
 */
export class CountryPost {
  public static readonly typeId = 20;

  public static readonly typeMonarch = 1;
  public static readonly typeWarrior = 2;
  public static readonly typeGrandGeneral = 3;

  public constructor(public type: number = 0,
                     public countryId: number = 0,
                     public characterId: number = 0,
                     public character: Character) {}
}

export class CountryMessage {
  public static readonly typeId = 29;

  public static readonly typeCommanders = 1;
  public static readonly typeSolicitation = 2;
  public static readonly typeUnified = 3;

  public constructor(public type: number = 0,
                     public countryId: number = 0,
                     public message: string = '',
                     public writerCharacterName: string = '',
                     public writerPost: number = 0,
                     public writerIcon: CharacterIcon = new CharacterIcon()) {}
}

/**
 * 国
 */
export class Country {
  public static readonly typeId = 10;
  public static readonly default = new Country(-1, '無所属', 0);

  public constructor(public id: number = 0,
                     public name: string = '',
                     public colorId: number = 0,
                     public established: GameDateTime = new GameDateTime(),
                     public capitalTownId: number = 0,
                     public posts: CountryPost[] = [],
                     public alliances: CountryAlliance[] = [],
                     public wars: CountryWar[] = [],
                     public townWars: TownWar[] = [],
                     public hasOverthrown: boolean = false,
                     public overthrownGameDate: GameDateTime = new GameDateTime(),
                     public lastMoneyIncomes?: number,
                     public lastRiceIncomes?: number,
                     public safeMoney?: number) {}
}

export class CountryExtraData {
  public static readonly default = new CountryExtraData();

  public constructor(public countryId: number = 0,
                     public isJoinLimited: boolean = false) {}
}

export class EntryExtraData {
  public static readonly default = new EntryExtraData();

  public constructor(public attributeMax: number = 0,
                     public attributeSumMax: number = 0,
                     public countryData: CountryExtraData[] = []) {}
}

export abstract class CountryDipromacy {
  public static isEqualCountry<T extends { id: number, requestedCountryId: number, insistedCountryId: number }>(
      item: T, country1: number, country2: number) {
    return (item.requestedCountryId === country1 && item.insistedCountryId === country2) ||
           (item.insistedCountryId === country1 && item.requestedCountryId === country2);
  }

  public constructor(public id: number = 0,
                     public status: number = 0,
                     public requestedCountryId: number = 0,
                     public insistedCountryId: number = 0,
                     public requestedCountry: Country = new Country(),
                     public insistedCountry: Country = new Country()) {}
}

/**
 * 同盟
 */
export class CountryAlliance extends CountryDipromacy {
  public static readonly typeId = 21;

  public static readonly statusNone = 0;
  public static readonly statusRequesting = 1;
  public static readonly statusDismissed = 2;
  public static readonly statusAvailable = 3;
  public static readonly statusInBreaking = 4;
  public static readonly statusBroken = 5;

  public isPublic: boolean = false;
  public breakingDelay: number = 0;
}

/**
 * 宣戦布告
 */
export class CountryWar extends CountryDipromacy {
  public static readonly typeId = 22;

  public static readonly statusAvailable = 1;
  public static readonly statusStopRequesting = 2;
  public static readonly statusStoped = 3;
  public static readonly statusInReady = 4;

  public requestedStopCountryId: number = 0;
  public requestedStopCountry: Country = new Country();
  public startGameDate: GameDateTime = new GameDateTime();
}

export class TownWar extends CountryDipromacy {
  public static readonly typeId = 30;

  public static readonly statusInReady = 1;
  public static readonly statusAvailable = 2;
  public static readonly statusTerminated = 3;

  public gameDate: GameDateTime = new GameDateTime();
  public townId: number = 0;
  public town: Town = new Town();
}

export abstract class TownBase implements IIdentitiedEntity {
  public static getRiceTrend(town: TownBase): number {
    return Math.round(town.ricePrice * 1000000) / 1000000;
  }

  public static getRiceToMoneyPrice(town: TownBase, rice: number): number {
    return Math.floor(TownBase.getRiceTrend(town) * rice);
  }

  public static getMoneyToRicePrice(town: TownBase, money: number): number {
    return Math.floor((2 - TownBase.getRiceTrend(town)) * money);
  }

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
                     public ricePrice: number = 0,
                     public townBuilding: number = 0,
                     public townBuildingValue: number = 0,
                     public countryBuilding: number = 0,
                     public countryBuildingValue: number = 0,
                     public countryLaboratory: number = 0,
                     public countryLaboratoryValue: number = 0) {}
}

/**
 * 都市
 */
export class Town extends TownBase implements IIdentitiedEntity {
  public static readonly typeId = 11;

  public static readonly default: Town = new Town(-1);

  public static readonly typeAgriculture = 1;
  public static readonly typeCommercial = 2;
  public static readonly typeFortress = 3;
  public static readonly typeLarge = 4;

  public static readonly countryBuildingSafe = 1;
  public static readonly countryBuildingSpy = 2;
  public static readonly countryBuildingWork = 3;
  public static readonly countryBuildingSoldier = 4;
  public static readonly countryBuildingSecretary = 5;

  public static isScouted(town: TownBase): boolean {
    const scoutMethod = (town as ScoutedTown).scoutMethod;
    return scoutMethod !== undefined && scoutMethod !== 0;
  }
}

/**
 * 諜報された都市
 */
export class ScoutedTown extends TownBase implements IIdentitiedEntity {
  public static readonly typeId = 16;

  public scoutedTownId: number = 0;
  public scoutedCharacterId?: number;
  public scoutMethod?: number;
  public scoutedGameDateTime?: GameDateTime;

  public characters: Character[] = [];
  public defenders: Character[] = [];
}

/**
 * 武将のコマンドパラメータ
 */
export class CharacterCommandParameter {
  public constructor(public type: number,
                     public numberValue?: number,
                     public stringValue?: string) {}
}

/**
 * 武将のコマンド
 */
export class CharacterCommand {
  public static readonly typeId: number = 14;

  public static updateName(command: CharacterCommand) {
    const cmd = def.getCommandNameByType(command.type);
    if (cmd) {
      command.name = cmd.solve(command.parameters);
    } else {
      command.name = '';
    }
  }

  public constructor(public commandNumber: number = 0,
                     public characterId: number = 0,
                     public type: number = 0,
                     public name: string = '',
                     public parameters: CharacterCommandParameter[] = [],
                     public gameDate: GameDateTime = new GameDateTime(),
                     public date?: DateTime,
                     public isSelected?: boolean,
                     public canSelect?: boolean) {}
}

/**
 * 武将のアイコン
 */
export class CharacterIcon {
  public static readonly typeId = 18;
  public static readonly default: CharacterIcon = CharacterIcon.createDefault();

  public static isDefault(icon: CharacterIcon): boolean {
    if (icon && (icon.isNotDefaultPrivate || (!icon.id && icon.fileName === ''))) {
      return true;
    } else {
      return false;
    }
  }

  public static getUri(icon: CharacterIcon): string {
    if (icon) {
      if (icon.type === 2) {
        // アップロードされたアイコン
        return def.UPLOADED_ICONS_HOST + icon.fileName;
      } else if (icon.type === 3) {
        // Gravatar
        return 'https://www.gravatar.com/avatar/' + icon.fileName + '?s=128';
      } else {
        // デフォルトのアイコン
        return def.DEFAULT_ICONS_HOST + icon.fileName;
      }
    } else {
      return '';
    }
  }

  public static getMain(icons: CharacterIcon[]): CharacterIcon | undefined {
    return Enumerable.from(icons).firstOrDefault((i) => i.isMain);
  }

  public static getMainOrFirst(icons: CharacterIcon[]): CharacterIcon | undefined {
    const main = CharacterIcon.getMain(icons);
    if (main) {
      return main;
    } else {
      return Enumerable.from(icons).firstOrDefault();
    }
  }

  public static getMainUri(icons: CharacterIcon[]): string {
    const main = CharacterIcon.getMain(icons);
    if (main) {
      return CharacterIcon.getUri(main);
    } else {
      if (icons.length > 0) {
        return CharacterIcon.getUri(icons[0]);
      } else {
        return CharacterIcon.getUri(CharacterIcon.default);
      }
    }
  }

  private static createDefault(): CharacterIcon {
    const icon = new CharacterIcon(0, 0, true, 1, '0.gif');
    icon.isNotDefaultPrivate = true;
    return icon;
  }

  private isNotDefaultPrivate?: boolean = false;

  public constructor(public id: number = 0,
                     public characterId: number = 0,
                     public isMain: boolean = false,
                     public type: number = 0,
                     public fileName: string = '') {}
}

/**
 * 武将の更新ログ
 */
export class CharacterLog implements IIdentitiedEntity {
  public static readonly typeId = 13;

  public constructor(public id: number,
                     public message: string,
                     public date: DateTime,
                     public gameDate: GameDateTime) {}
}

/**
 * 手紙向けの武将データ
 */
export class CharacterChatData {
  public constructor(public id: number,
                     public name: string) {}
}

/**
 * 手紙
 */
export class ChatMessage implements IIdentitiedEntity {
  public static readonly typeId = 17;

  public static readonly typeSelfCountry = 1;
  public static readonly typeOtherCountry = 2;
  public static readonly typePrivate = 3;
  public static readonly typeUnit = 4;
  public static readonly typeTown = 5;
  public static readonly typeGlobal = 6;
  public static readonly typeSimpleBbs = 7;
  public static readonly typePromotion = 8;
  public static readonly typePromotionAccepted = 9;
  public static readonly typePromotionRefused = 10;

  public constructor(public id: number,
                     public characterCountryId: number,
                     public type: number,
                     public message: string,
                     public posted: DateTime,
                     public receiverName: string,
                     public character?: CharacterChatData,
                     public characterIcon?: CharacterIcon,
                     public typeData?: number,
                     public typeData2?: number) {}
}

export class UnitMember {
  public static readonly typeId = 24;

  public static readonly postNormal = 1;
  public static readonly postLeader = 2;

  public constructor(public character: Character = new Character(-1),
                     public characterId: number = 0,
                     public post: number = 0) {}
}

export class Unit {
  public static readonly typeId = 23;

  public constructor(public id: number = 0,
                     public countryId: number = 0,
                     public name: string = '',
                     public message: string = '',
                     public isLimited: boolean = false,
                     public members: UnitMember[] = [],
                     public isSelected: boolean = false,
                     public leader: UnitMember = new UnitMember()) {}
}

export class BattleLogLine {
  public constructor(public id: number = 0,
                     public battleLogId: number = 0,
                     public turn: number = 0,
                     public attackerDamage: number = 0,
                     public attackerNumber: number = 0,
                     public defenderDamage: number = 0,
                     public defenderNumber: number = 0) {}
}

export class BattleLog {
  public static readonly defenderCharacter = 1;
  public static readonly defenderWall = 3;

  public constructor(public id: number = 0,
                     public town: Town = Town.default,
                     public defenderType: number = 0,
                     public attackerCache: Character = new Character(-1),
                     public defenderCache: Character = new Character(-1),
                     public maplog: MapLog = new MapLog(-1),
                     public lines: BattleLogLine[] = []) {}
}

export class CountryResearch {
  public constructor(public id: number,
                     public status: number,
                     public type: number,
                     public level: number,
                     public progress: number,
                     public progressMax: number) {}
}

export class ThreadBbsReply {
  public title: string = '';
  public text: string = '';
  public parentId: number = 0;
}

export class ThreadBbsItem implements IIdentitiedEntity {
  public static readonly typeId = 26;

  public static readonly typeCountryBbs = 1;
  public static readonly typeGlobalBbs = 2;

  public constructor(public id: number,
                     public type: number,
                     public parentId: number,
                     public children: ThreadBbsItem[],
                     public countryId: number,
                     public character: Character,
                     public characterIcon: CharacterIcon,
                     public title: string,
                     public text: string,
                     public written: DateTime,
                     public isRemove: boolean,
                     public isOpen?: boolean) {}
}

export class CharacterOnline {
  public static readonly typeId = 27;

  public static readonly statusOffline = 0;
  public static readonly statusActive = 1;
  public static readonly statusInactive = 2;

  public constructor(public status: number,
                     public character: Character) {}
}

export class Reinforcement {
  public static readonly typeId = 28;

  public static readonly statusNone = 0;
  public static readonly statusRequesting = 1;
  public static readonly statusRequestDismissed = 2;
  public static readonly statusRequestCanceled = 3;
  public static readonly statusActive = 4;
  public static readonly statusReturned = 5;
  public static readonly statusSubmited = 6;

  public constructor(public id: number,
                     public characterId: number,
                     public characterCountryId: number,
                     public requestedCountryId: number,
                     public status: number) {}
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
   * 武将のすべてのコマンドを取得（欠番がある場合もあるので注意）
   */
  public static async getAllCommands(): Promise<{ commands: CharacterCommand[], secondsNextCommand: number }> {
    try {
      const result = await axios.get<{ commands: CharacterCommand[], secondsNextCommand: number }>
        (def.API_HOST + 'commands', this.authHeader);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 武将のコマンドを取得（欠番がある場合もあるので注意）
   */
  public static async getCommands(months: GameDateTime[]): Promise<CharacterCommand[]> {
    try {
      const parameters = Enumerable.from(months)
        .select((m) => GameDateTime.toNumber(m))
        .toArray()
        .join(',');
      const result = await axios.get<{ commands: CharacterCommand[], secondsNextCommand: number }>
        (def.API_HOST + 'commands?months=' + parameters, this.authHeader);
      return result.data.commands;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 武将のコマンドを設定
   * @param commands 入力するコマンド
   */
  public static async setCommands(commands: CharacterCommand[]) {
    try {
      await axios.put(def.API_HOST + 'commands', commands, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getCharacter(id: number): Promise<Character> {
    try {
      const result = await axios.get<ApiData<Character>>
        (def.API_HOST + 'character/' + id, this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 武将のすべてのアイコンを取得
   */
  public static async getAllIcons(): Promise<CharacterIcon[]> {
    try {
      const result = await axios.get<ApiArrayData<CharacterIcon>>
        (def.API_HOST + 'icons', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getAllCharacters(): Promise<Character[]> {
    try {
      const result = await axios.get<ApiArrayData<Character>>
        (def.API_HOST + 'characters', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getAllCountries(): Promise<Country[]> {
    try {
      const result = await axios.get<ApiArrayData<Country>>
        (def.API_HOST + 'countries', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 都市にいる武将をすべて取得
   */
  public static async getAllCharactersAtTown(townId: number): Promise<Character[]> {
    try {
      const result = await axios.get<ApiArrayData<Character>>
        (def.API_HOST + 'town/' + townId + '/characters', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 都市にいる守備武将をすべて取得
   */
  public static async getAllDefendersAtTown(townId: number): Promise<Character[]> {
    try {
      const result = await axios.get<ApiArrayData<Character>>
        (def.API_HOST + 'town/' + townId + '/defenders', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 現在いる都市を諜報
   */
  public static async scoutTown(): Promise<any> {
    try {
      await axios.post
        (def.API_HOST + 'town/scout', {}, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 国にいる武将をすべて取得
   */
  public static async getAllCharactersBelongsCountry(countryId: number): Promise<Character[]> {
    try {
      const result = await axios.get<ApiArrayData<Character>>
        (def.API_HOST + 'country/' + countryId + '/characters', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 国の役職を設定
   * @param characterId 設定する相手のID
   * @param post 設定する役職ID
   */
  public static async setCountryPost(characterId: number, post: number): Promise<any> {
    try {
      await axios.put
        (def.API_HOST + 'country/posts', {
          type: post,
          characterId,
        }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async setCountryMessage(message: string, type: number): Promise<any> {
    try {
      await axios.put(def.API_HOST + 'country/messages', {
        message,
        type,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 同盟情報を送信
   * @param alliance 設定する同盟情報
   */
  public static async setCountryAlliance(alliance: CountryAlliance): Promise<any> {
    try {
      await axios.put
        (def.API_HOST + 'country/' + alliance.insistedCountryId + '/alliance', alliance, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 戦争情報を送信
   * @param war 設定する戦争情報
   */
  public static async setCountryWar(war: CountryWar): Promise<any> {
    try {
      await axios.put
        (def.API_HOST + 'country/' + war.insistedCountryId + '/war', war, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async setTownWar(townId: number): Promise<any> {
    try {
      await axios.put
        (def.API_HOST + 'town/' + townId + '/war', {}, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getCountryChatMessage(sinceId?: number, count?: number): Promise<ChatMessage[]> {
    try {
      const result = await axios.get<ApiArrayData<ChatMessage>>(def.API_HOST + 'chat/country?' +
        this.buildQueryParameters({
          sinceId,
          count,
        }), this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async postCountryChatMessage(mes: string, icon: CharacterIcon): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'chat/country', {
        message: mes,
        characterIconId: icon.id,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async postGlobalChatMessage(mes: string, icon: CharacterIcon): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'chat/global', {
        message: mes,
        characterIconId: icon.id,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getGlobalChatMessage(since: number, count: number): Promise<ChatMessage[]> {
    try {
      const result = await axios.get<ApiArrayData<ChatMessage>>(
        def.API_HOST + 'chat/global?sinceId=' + since + '&count=' + count,
        this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async postPrivateChatMessage(mes: string, icon: CharacterIcon, toCharaId: number): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'chat/character/' + toCharaId, {
        message: mes,
        characterIconId: icon.id,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getPrivateChatMessage(since: number, count: number): Promise<ChatMessage[]> {
    try {
      const result = await axios.get<ApiArrayData<ChatMessage>>(
        def.API_HOST + 'chat/character?sinceId=' + since + '&count=' + count,
        this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async postOtherCountryChatMessage(mes: string, icon: CharacterIcon, toCountryId: number): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'chat/country/' + toCountryId, {
        message: mes,
        characterIconId: icon.id,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async setPromotionStatus(messageId: number, status: number): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'chat/promotion', {
        id: messageId,
        type: status,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getUnits(): Promise<Unit[]> {
    try {
      const result = await axios.get<Unit[]>(def.API_HOST + 'units', this.authHeader);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async createUnit(unit: Unit): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'unit', {
        name: unit.name,
        message: unit.message,
        isLimited: unit.isLimited,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async joinUnit(id: number): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'unit/' + id + '/join', {}, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async leaveUnit(): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'unit/leave', {}, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async updateUnit(id: number, unit: Unit): Promise<any> {
    try {
      await axios.put(def.API_HOST + 'unit/' + id, {
        name: unit.name,
        message: unit.message,
        isLimited: unit.isLimited,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async removeUnit(id: number): Promise<any> {
    try {
      await axios.delete(def.API_HOST + 'unit/' + id, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getBattleLog(id: number): Promise<BattleLog> {
    try {
      const result = await axios.get<BattleLog>(def.API_HOST + 'battle/' + id, this.authHeader);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getCountryBbsItems(): Promise<ThreadBbsItem[]> {
    try {
      const result = await axios.get<ThreadBbsItem[]>(def.API_HOST + 'bbs/country', this.authHeader);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async writeCountryBbsItem(text: string, parentId: number = 0, title: string = ''): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'bbs/country', {
        text,
        parentId,
        title,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async removeCountryBbsItem(id: number): Promise<any> {
    try {
      await axios.delete(def.API_HOST + 'bbs/country/' + id, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async writeGlobalBbsItem(text: string, parentId: number = 0, title: string = ''): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'bbs/global', {
        text,
        parentId,
        title,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async removeGlobalBbsItem(id: number): Promise<any> {
    try {
      await axios.delete(def.API_HOST + 'bbs/global/' + id, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async entry(chara: Character,
                            icon: CharacterIcon,
                            password: string,
                            country: Country,
                            invitationCode?: string): Promise<AuthenticationData> {
    try {
      const result = await axios.post<ApiData<AuthenticationData>>(def.API_HOST + 'entry', {
        character: {
          name: chara.name,
          aliasId: chara.aliasId,
          strong: chara.strong,
          intellect: chara.intellect,
          leadership: chara.leadership,
          popularity: chara.popularity,
          townId: chara.townId,
          message: chara.message,
        },
        icon: {
          type: icon.type,
          fileName: icon.fileName,
        },
        password,
        country: {
          name: country.name,
          colorId: country.colorId,
        },
        invitationCode,
      });
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getEntryExtraData(): Promise<EntryExtraData> {
    try {
      const result = await axios.get<EntryExtraData>(def.API_HOST + 'entry/data');
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getMapLog(sinceId: number, count: number = 50): Promise<MapLog[]> {
    try {
      const result = await axios.get<MapLog[]>(def.API_HOST + 'maplog?since=' + sinceId + '&count=' + count);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getCharacterLog(sinceId: number, count: number = 50): Promise<CharacterLog[]> {
    try {
      const result = await axios.get<ApiArrayData<CharacterLog>>(
        def.API_HOST + 'character/log?since=' + sinceId + '&count=' + count, this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async setOnlineStatus(status: number): Promise<any> {
    try {
      const statusText = status === CharacterOnline.statusActive ? 'active' : 'inactive';
      await axios.put(def.API_HOST + 'online/' + statusText, {}, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async setReinforcementStatus(status: number,
                                             characterId?: number,
                                             requestedCountryId?: number): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'country/reinforcement', {
        status,
        characterId,
        requestedCountryId,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async addSoldierType(type: CharacterSoldierType): Promise<CharacterSoldierType> {
    try {
      const result = await axios.post<CharacterSoldierType>
        (def.API_HOST + 'soldiertypes', JSON.parse(JSON.stringify(type)), this.authHeader);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async updateSoldierType(type: CharacterSoldierType): Promise<CharacterSoldierType> {
    try {
      const result = await axios.put<CharacterSoldierType>
        (def.API_HOST + 'soldiertypes', JSON.parse(JSON.stringify(type)), this.authHeader);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async getSoldierType(id: number): Promise<CharacterSoldierType> {
    try {
      const result = await axios.get<CharacterSoldierType>(
        def.API_HOST + 'soldiertypes/' + id, this.authHeader);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 認証のときに利用するヘッダ
   */
  private static get authHeader(): AxiosRequestConfig {
    return {
      headers: {
        Authorization: 'Bearer ' + current.authorizationToken,
      },
    };
  }

  private static pickException(ex: any) {
    if (ex.response) {
      return ex.response.data;
    } else {
      return { data: ApiError.serverConnectionFailed, innerException: ex };
    }
  }

  private static buildQueryParameters(param: any): string {
    const queries: string[] = [];
    Object.keys(param).forEach((key) => {
      if (param[key] !== undefined) {
        queries.push(key + '=' + param[key]);
      }
    });
    return queries.join('&');
  }

}
