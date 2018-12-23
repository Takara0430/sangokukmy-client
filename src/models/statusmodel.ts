import ArrayUtil from '@/models/common/arrayutil';
import Streaming from '@/api/streaming';
import ApiStreaming from '@/api/apistreaming';
import * as api from '@/api/api';
import Enumerable from 'linq';

export enum StatusParameterType {
  /**
   * 最大値が存在する値（農業、商業など）
   */
  ranged = 1,
  /**
   * 値だけ（武力、知力など）
   */
  noRange = 2,
  /**
   * テキスト値
   */
  text = 3,
}

export abstract class StatusParameter {
  public abstract get type(): StatusParameterType;

  public constructor(public readonly name: string) {}
}

class RangedStatusParameter extends StatusParameter {
  public get type(): StatusParameterType {
    return StatusParameterType.ranged;
  }

  public get valueRatio(): number {
    if (this.max !== 0) {
      return this.value / this.max * 100;
    } else {
      return 0;
    }
  }

  public constructor(name: string, public value: number, public max: number) {
    super(name);
  }
}

class NoRangeStatusParameter extends StatusParameter {
  public get type(): StatusParameterType {
    return StatusParameterType.noRange;
  }

  public constructor(name: string, public value: number) {
    super(name);
  }
}

class TextStatusParameter extends StatusParameter {
  public get type(): StatusParameterType {
    return StatusParameterType.text;
  }

  public constructor(name: string, public value: string) {
    super(name);
  }
}

export default class StatusModel {
  public gameDate: api.GameDateTime = new api.GameDateTime();
  public towns: api.Town[] = [];
  public countries: api.Country[] = [];
  public town: api.Town = new api.Town(-1);
  public townParameters: StatusParameter[] = [];
  public character: api.Character = new api.Character(-1);
  public commands: api.CharacterCommand[] = [];

  public get townCountryColor(): number {
    if (this.town !== undefined) {
      const country = ArrayUtil.find(this.countries, this.town.countryId);
      if (country !== undefined) {
        return country.colorId;
      }
    }
    return 0;
  }

  public onCreate() {
    ApiStreaming.status.on<api.GameDateTime>(
      api.GameDateTime.typeId,
      (obj) => this.gameDate = obj);
    ApiStreaming.status.on<api.Town>(
      api.Town.typeId,
      (obj) => this.updateTown(obj));
    ApiStreaming.status.on<api.Country>(
      api.Country.typeId,
      (obj) => this.updateCountry(obj));
    ApiStreaming.status.on<api.Character>(
      api.Character.typeId,
      (obj) => this.updateCharacter(obj));
    ApiStreaming.status.start();

    // debug
    for (let i = 0; i < 200; i++) {
      this.commands.push({ name: 'あああ', gameDate: new api.GameDateTime(180, 1) } as api.CharacterCommand);
    }
    Enumerable
      .from(this.commands)
      .orderBy((c) => c.gameDate.toNumber())
      .forEach((c, index) => c.commandNumber = index + 1);
  }

  public onDestroy() {
    ApiStreaming.status.stop();
  }

  private updateTown(town: api.Town) {
    ArrayUtil.addItem(this.towns, town);

    // 現在表示中の都市を更新
    if (this.town.id < 0) {
      if (this.character.id >= 0 && town.id === this.character.townId) {
        this.setTown(town);
      }
    } else if (this.town.id === town.id) {
      this.setTown(town);
    }
  }

  private setTown(town: api.Town) {
    this.town = town;
    const country = ArrayUtil.find(this.countries, town.countryId);

    const ps: StatusParameter[] = [];
    if (country) {
      ps.push(new TextStatusParameter('国', country.name));
    } else {
      ps.push(new TextStatusParameter('国', '無所属'));
    }
    ps.push(new NoRangeStatusParameter('相場', town.ricePrice));
    ps.push(new NoRangeStatusParameter('農民', town.people));
    ps.push(new RangedStatusParameter('民忠', town.security, 100));
    ps.push(new RangedStatusParameter('農業', town.agriculture, town.agricultureMax));
    ps.push(new RangedStatusParameter('商業', town.commercial, town.commercialMax));
    ps.push(new RangedStatusParameter('技術', town.technology, town.technologyMax));
    ps.push(new RangedStatusParameter('城壁', town.wall, town.wallMax));
    ps.push(new RangedStatusParameter('守兵', town.wallguard, town.wallguardMax));
    this.townParameters = ps;
  }

  private updateCountry(country: api.Country) {
    ArrayUtil.addItem(this.countries, country);

    // 現在所在している都市の国であれば、国名を更新する
    if (country.id === this.town.countryId) {
      const townParameter = Enumerable.from(this.townParameters).firstOrDefault((tp) => tp.name === '国');
      if (townParameter) {
        (townParameter as TextStatusParameter).value = country.name;
      }
    }
  }

  private updateCharacter(character: api.Character) {
    this.character = character;

    // 現在表示中の都市が設定されていなければ、現在の武将の都市を設定
    if (this.town.id < 0) {
      const currentTown = ArrayUtil.find(this.towns, character.townId);
      if (currentTown) {
        this.town = currentTown;
      }
    }
  }
}
