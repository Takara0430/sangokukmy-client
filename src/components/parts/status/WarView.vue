<template>
  <div class="diplomacy-view loading-container">
    <div :class="'current-status alert alert-' + (status.id === 4 ? 'warning' : status.id === 1 ? 'danger' : 'info')">{{ status.name }}</div>
    <div v-if="diplomacy !== undefined && status.id !== 0" class="content-section current-diplomacy">
      <h3>戦争</h3>
      {{ diplomacy.startGameDate | gamedate }} 開戦
    </div>
    <div v-if="canEdit" class="editor">
      <button v-show="status.id ===   0 || status.id === 3" class="btn btn-secondary" @click="newData.status = 4" href="#">宣戦布告</button>
      <!--
      <button v-show="status.id ===   4 || status.id === 1" class="btn btn-secondary" @click="newData.status = 2" href="#">停戦申入</button>
      <button v-show="status.id === 102" class="btn btn-secondary" @click="newData.status = 3" href="#">停戦承認</button>
      <button v-show="status.id === 102" class="btn btn-primary"   @click="newData.status = 4" href="#">停戦拒否</button>
      <button v-show="status.id ===   2" class="btn btn-primary"   @click="newData.status = 4" href="#">停戦撤回</button>
      -->
      <div v-show="newData.status === 4 && (status.id === 0 || status.id === 3)" class="content-section">
        <h3>宣戦布告</h3>
        <GameDateTimePicker v-model="newData.startGameDate"/>
      </div>
    </div>
    <div class="loading" v-show="isSending"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import GameDateTimePicker from '@/components/parts/GameDateTimePicker.vue';

@Component({
  components: {
    GameDateTimePicker,
  },
})
export default class WarView extends Vue {
  @Prop() private diplomacy?: api.CountryWar;
  @Prop() private status!: def.CountryWarStatus;
  @Prop() private newData!: api.CountryWar;
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
