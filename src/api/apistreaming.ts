import Enumerable from 'linq';
import * as def from '../common/definitions';
import * as current from '../common/current';
import * as api from './api';
import Streaming from './streaming';

/**
 * ストリーミングを、三国志NETのAPIにとって使いやすい形式で利用できるクラス。
 * Streamingクラスのラッパ
 */
export default class ApiStreaming {

  /**
   * トップ画面のストリーミング
   */
  public static top = new ApiStreaming(def.API_HOST + 'api/values/streaming', 'GET');

  /**
   * ステータス画面のストリーミング
   */
  public static status = new ApiStreaming(def.API_HOST + 'api/values/streaming', 'GET');

  private listeners: ApiStreamingListener[] = [];
  private streaming: Streaming = new Streaming();

  private constructor(uri: string,
                      method: string) {
    // ストリーミングを初期化
    this.streaming.header = {
      Authorization: current.authorizationToken,
    };
    this.streaming.onReceiveObject = (obj) => this.onReceiveObject(obj);
    this.streaming.uri = uri;
    this.streaming.method = method;
  }

  /**
   * ストリーミングを開始
   */
  public start() {
    this.streaming.start();
  }

  /**
   * ストリーミングを停止
   */
  public stop() {
    this.streaming.stop();
  }

  /**
   * ストリーミングでオブジェクトを受け取った時のイベントを設定する。
   * 受け取るオブジェクトの型は、ジェネリックで指定する
   * @param onFire 受け取ったときのイベント
   */
  public on<T>(typeId: number, onFire: (obj: T) => void) {
    this.listeners.push(new ApiStreamingListener(typeId, onFire));
  }

  private fire<T>(typeId: number, obj: T) {
    Enumerable
      .from(this.listeners)
      .where((element) => element.type === typeId)
      .forEach((element) => {
        element.onFire(obj);
      });
  }

  private onReceiveObject(obj: any) {
    switch (obj.typeId) {
      case api.DateTime.typeId:
        this.fire(obj.typeId, obj as api.DateTime);
        break;
      case api.MapLogType.typeId:
        this.fire(obj.typeId, obj as api.MapLogType);
        break;
      case api.MapLog.typeId:
        this.fire(obj.typeId, obj as api.MapLog);
        break;
      case api.CharacterUpdateLog.typeId:
        this.fire(obj.typeId, obj as api.CharacterUpdateLog);
        break;
      default:
        this.fire(obj.typeId, obj);
        break;
    }
  }
}

class ApiStreamingListener {
  public constructor(public type: number, public onFire: (obj: any) => void) {
  }
}
