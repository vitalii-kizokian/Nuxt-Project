<template>
  <div id="task-actions-wrapper" class="task-actions p-025 bg-white">
    <div class="action-left d-flex gap-05" id="ta-action-left">
      <!-- <div class="d-flex gap-05 py-025 px-05 shape-rounded cursor-pointer text-success bg-success-sub6 bg-hover-success-sub3" id="ta-add-task-button" v-on:click.stop="showCreateTaskModal">
        <bib-icon icon="add" variant="success" :scale="1.25" class=""></bib-icon> <span id="ta-add-task-text" class="">New Task</span>
      </div> -->
      <bib-button label="New Task" variant="primary-24" icon="add" class="" @click.native.stop="showCreateTaskModal"></bib-button>
      <!-- <div class="d-flex gap-05 py-025 px-05 shape-rounded cursor-pointer text-success bg-success-sub6 bg-hover-success-sub3" id="ta-add-section-button" v-show="!group"  v-on:click.stop="addSection">
        <bib-icon icon="add" variant="success" :scale="1.25" class=""></bib-icon> <span id="ta-add-section-text" class="" >New Section</span>
      </div> -->
      <bib-button v-show="group == 'default'" label="New Section" variant="primary-24" icon="add" class="" @click.native.stop="addSection"></bib-button>
    </div>
    <div class="action-right d-flex gap-05" id="ta-action-right">
      <template>
        <bib-input size="sm" type="text" v-model="searchText" name="name" @input="$emit('search-mytasks', searchText)" placeholder="Search Tasks..." :variant="searchText.length > 50 ? 'alert': ''"></bib-input>
      </template>
      <ul class="actions" id="ta-action-right-actions">
        <li class="action" id="ta-action1" >
          <sorting-comp :items="viewing" icon="eye-open" activeIcon="tick" tooltip="View" v-on:change-sort="changeViewName"></sorting-comp>
        </li>
        <li class="action" id="ta-action3" >
          <group-comp label="Group by" :items="groupBy" icon="accessibility-braille-solid" activeIcon="tick" tooltip="Group By" v-on:change-sort="groupMyTasks($event)"></group-comp>
        </li>
        <li class="action" id="ta-action2" >
          <sorting-comp :items="sorting" icon="swap-vertical" tooltip="Sort By" v-on:change-sort="sortBy"></sorting-comp>
        </li>
        
        <li class="action" id="ta-action5" >
          <div class="d-flex width-2 height-2 align-center justify-center bg-light bg-hover-gray2 shape-circle p-025 cursor-pointer" id="ta-action5-link" v-tooltip="'List/Grid'">
            <bib-icon v-if="gridType == 'list'" icon="table" variant="gray6" @click.native="changeGridType('grid')"></bib-icon>
            <bib-icon v-if="gridType == 'grid'" icon="list" variant="gray6" @click.native="changeGridType('list')"></bib-icon>
          </div>
        </li>
      </ul>
    </div>
    
  </div>
</template>

<script>
import { VIEW_FILTER, USER_TASK_SORT,MY_TASK_GROUP} from 'config/constants.js'

export default {
  props: {
    gridType: {
      type: String,
      default: "list",
      sortDir: {default: "asc"}
    },
    group:{
      type: String,
      default: "",
    }
  },
  data() {
    return {
      selectInfo: null,
      sortName: '',
      viewing: VIEW_FILTER,
      groupBy: MY_TASK_GROUP,
      sorting: USER_TASK_SORT,
      searchText: ""
    };
  },
  methods: {
    changeGridType($event) {
      this.$emit("change-grid-type", $event);
    },
    showCreateTaskModal() {
      this.$emit("create-task", false) //event will be captured by parent only
      this.$nuxt.$emit("create-task", false) //event will be available to all
    },
    groupMyTasks($event) {
      this.$emit("myTaskGroup", $event)
    },
    addSection(){
      this.$emit("add-section")
    },

    sortBy($event) {
      this.$emit("sort", $event)
    },

    changeViewName($event){
      this.$emit("filterView", $event)
    }

  },
};

</script>

<style scoped lang="scss">
.task-actions {
  display: flex;
  border-bottom: 1px solid $gray4;
  align-items: center;
}

.action-right {
  margin-left: auto;
}

.actions {
  display: flex;
  color: $gray1;

  span {
    margin-left: 5px;
    font-size: 13px;
  }

  svg,
  svg g {
    fill: $gray1;
  }
}

.action {
  display: flex;
  padding: 0 4px;
  align-items: center;
}

.button {
  .list.filter {
    .list__item {
      height: auto;

      .input--sm {
        input {
          min-height: 1.75rem;
        }
      }
    }

  }
}

</style>