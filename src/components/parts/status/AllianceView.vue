<template>
  <div class="diplomacy-view loading-container">
    <div :class="'current-status alert alert-' + (status.id === 101 ? 'primary' : status.id === 3 ? 'success' : status.id === 4 ? 'warning' : 'info')">{{ status.name }}</div>
    <div v-if="diplomacy !== undefined && status.id !== 0 && status.id !== 2 && status.id !== 5" class="content-section current-diplomacy">
      <h3>同盟条件</h3>
      破棄猶予：{{ diplomacy.breakingDelay }}ヶ月<br>
      公表：{{ diplomacy.isPublic ? 'する' : 'しない' }}
    </div>
    <div v-if="canEdit" class="editor">
      <button v-show="status.id ===   1" :class="{ 'btn': true, 'btn-secondary': newData.status === 0, 'btn-outline-secondary': newData.status !== 0 }" @click="newData.status = 0" href="#">撤回</button>
      <button v-show="status.id === 101" :class="{ 'btn': true, 'btn-secondary': newData.status === 2, 'btn-outline-secondary': newData.status !== 2 }" @click="newData.status = 2" href="#">拒否</button>
      <button v-show="status.id === 101" :class="{ 'btn': true, 'btn-secondary': newData.status === 3, 'btn-outline-secondary': newData.status !== 3 }" @click="newData.status = 3" href="#">承認</button>
      <button v-show="status.id ===   0 || status.id === 2 || status.id === 5" :class="{ 'btn': true, 'btn-secondary': newData.status === 1, 'btn-outline-secondary': newData.status !== 1 }" @click="newData.status = 1" href="#">同盟申入</button>
      <button v-show="status.id ===   3" :class="{ 'btn': true, 'btn-secondary': newData.status === 4, 'btn-outline-secondary': newData.status !== 4 }" @click="newData.status = 4" href="#">破棄</button>
      <div v-show="newData.status === 0" class="content-section">
        <h3>同盟申入撤回</h3>
      </div>
      <div v-show="newData.status === 2" class="content-section">
        <h3>同盟打診拒否</h3>
      </div>
      <div v-show="newData.status === 3" class="content-section">
        <h3>同盟打診承認（同盟開始）</h3>
      </div>
      <div v-show="newData.status === 4" class="content-section">
        <h3>同盟破棄</h3>
      </div>
      <div v-show="newData.status === 1" class="content-section">
        <h3>同盟申入</h3>
        <div class="form-group">
          <label for="allianceOption2">破棄猶予（ヶ月）</label>
          <input type="number" max="48" min="0" id="allianceOption2" class="form-control" v-model="newData.breakingDelay">
        </div>
        <div class="form-check">
          <button type="button" :class="'btn btn-toggle' + (newData.isPublic ? ' selected' : '')" @click="newData.isPublic ^= true">同盟関係を公表する</button>
        </div>
      </div>
    </div>
    <div class="loading" v-show="isSending"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import * as def from '@/common/definitions';

@Component({
  components: {
  },
})
export default class AllianceView extends Vue {
  @Prop() private diplomacy?: api.CountryAlliance;
  @Prop() private status!: def.CountryAllianceStatus;
  @Prop() private newData!: api.CountryAlliance;
  @Prop() private isSending!: boolean;
  @Prop() private canEdit!: boolean;
  @Prop() private isShow!: boolean;

  @Watch('isShow')
  private onIsShowChanged() {
    if (this.isShow) {
      this.newData.status = -1;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';
@import '@/scss/diplomacy-view-common.scss';

.diplomacy-view {
  overflow: auto;
}
</style>
