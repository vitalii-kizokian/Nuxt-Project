<template>
  <div class="picker-wrapper w-100" id="dept-select-wrapper" v-click-outside="onClickOutside" >
    <div id="dept-select-trigger-open" class="user-data cursor-pointer height-2 align-center justify-between" @click.stop="triggerOpen">
      <div id="dept-select-inner-wrap" class="align-center flex-grow-1 gap-025">
        <bib-icon icon="node-solid" variant="gray4"></bib-icon>
        <span v-if="localDept" id="dept-select-local-dept-label" class="text-truncate" style="max-width: 7rem;">
           {{localDept.label}}
        </span>
      </div>
      <bib-icon icon="arrow-down" variant="gray4" :scale="0.5"></bib-icon>
    </div>
    <div v-if="show" class="picker-content" id="dept-select-content">
      <!-- <div class="" style="max-height: 15rem; overflow-y: auto; overflow-x: clip; " id="dept-select-dept-label-wrap"> -->
      <div class="" id="dept-select-dept-label-wrap">
        <ul class="m-0 p-0 text-left" id="dept-select-dept-label-list">
          <li v-for="(dpt, index) in departments" :id="'dept-select-dept-label'+index" :key="dpt.value" class="p-025 font-md cursor-pointer align-center gap-025 bg-hover-light text-hover-dark" @click.stop="selected(dpt)">
            <bib-icon icon="node-solid" variant="gray4"></bib-icon>
            {{dpt.label}}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
export default {

  name: 'DeptSelect',

  props: {
    dept: { type: Object },
  },

  data() {
    return {
      show: false,
      // localDept: { value: null, label: "No department" },
      localDept: {},
      // filterKey: "",      
    }
  },
  watch: {
    dept(newVal) {
          if (newVal) {
          this.localDept = this.departments.find( d => d.value == newVal.id)
        } else {
          this.localDept = { label: '--', value: null }
        }
    },
    departments(newValue){
      if (this.dept) {
        this.localDept = newValue.find( d => d.value == this.dept.id)
      } else {
        this.localDept = { label: '--', value: 0 }
      }
    }
  },
  computed: {
    ...mapGetters({
      departments: "department/getAllDepartments",
    }),
  },
  mounted() {
    if (this.dept) {
      this.localDept = this.departments.find( d => d.value == this.dept.id)
    } else {
      this.localDept = { label: '--', value: null }
    }
  },
  methods: {
    triggerOpen() {
      this.show = !this.show
      this.$emit("close-other")
    },
    selected(dept){
      this.localDept = dept
      this.$emit("change", dept)
      this.show = false
    },
    onClickOutside() {
      this.show = false
    },
  }
}

</script>
<style lang="scss" scoped>
.picker-wrapper {
  position: relative;

  .user-data {
    border: 0 none;
    background-color: transparent;
    font-size: $base-size;
  }

  .picker-content {
    position: absolute;
    z-index: 55;
    left: -5px;
    top: -5px;
    min-height: fit-content;
    max-height: 30rem;
    min-width: calc(100% + 10px);
    background-color: $white;
    border: 1px solid $gray4;
    padding: 0.5rem;
    border-radius: 0.25rem;
    box-shadow: 0 2px 10px rgba(100, 100, 100, 0.25);
  }

  .picker-input {
    font-size: $font-size-sm;
    border-radius: 0.2rem;
    border: 1px solid $gray2;
    width: 100%;
    margin: 0.3rem 0;
    padding: 0.3rem 0.4rem;

    &:focus {
      outline: none;
      border-color: $gray6;
      box-shadow: 0 0 5px $gray5;
    }
  }
}

</style>
