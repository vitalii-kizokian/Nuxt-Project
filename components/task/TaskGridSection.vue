<template>
  <div id="tgs-scroll" class="h-100 overflow-x-auto position-relative bg-light" style="min-height: 30rem;" ref="gridTable">
    <draggable :list="localdata" class="d-flex " :move="moveSection" :disabled="group != 'default'" :options="dragOptions" v-on:end="$emit('section-dragend', localdata)" handle=".section-drag-handle">
      <div class="task-grid-section " :id="'task-grid-section-wrapper-'+section.id" v-for="section in localdata" :key="`grid-${templateKey}${section.title}${section.id}`" :class="{'non-draggable': section.title == 'Unassigned'}" style="padding-bottom: 0px !important;">
        <div class="w-100 d-flex align-center section-title-wrapper border-bottom-gray2 mb-075" :id="'tgs-inner-wrap-'+section.id" :class="{'active': sectionEdit}" >
          <task-grid-section-title :section="section" @update-title="renameSection"></task-grid-section-title>
          <div class="d-flex align-center section-options" :id="'tgs-section-options-'+section.id">
            <div class="cursor-pointer shape-rounded bg-hover-gray2 mx-05 align-center" v-on:click.stop="showBlankTask(section.id)">
              <bib-icon icon="add" variant="gray5" :scale="1.25"></bib-icon>
            </div>
            <bib-popup pop="elipsis" icon-variant="gray5" class="bg-hover-gray2" :scale="1">
              <template v-slot:menu>
                <div :id="'tgs-list'+section.id" class="list border-light box-shadow" >
                  <span class="list__item" :id="'tgs-list-1'+section.id" v-on:click.stop="showBlankTask(section.id)">
                    <div class="d-flex align-center" :id="'tgs-list-flex-1'+section.id">
                      <bib-icon icon="add"></bib-icon>
                      <span class="ml-05" :id="'tgs-list-span'+section.id">Add task</span>
                    </div>
                  </span>
                  <!-- <span v-if="sectionType != 'department'" class="list__item" :id="'tgs-list-2'+section.id" v-on:click="$emit('section-rename',{id: section.id, title: section.title })">
                    <div class="d-flex align-center" :id="'tgs-list-flex-2'+section.id">
                      <bib-icon icon="pencil"></bib-icon>
                      <span class="ml-05" :id="'tgs-list-span'+section.id">Rename</span>
                    </div>
                  </span> -->
                  <hr v-if="sectionType != 'department' && section.isDeletable == true">
                  <span v-if="sectionType != 'department' && section.isDeletable == true" class="list__item list__item__danger" :id="'tgs-list-3'+section.id" v-on:click="$emit('section-delete',{id: section.id, title: section.title, projectId: section.projectId })" @mouseenter="deleteBtnHover = true" @mouseleave="deleteBtnHover = false">
                      <bib-icon icon="trash" :variant="deleteBtnHover ? 'white' : 'danger'"></bib-icon>
                      <span class="ml-05">Delete section</span>
                  </span>
                </div>
              </template>
            </bib-popup>
          </div>
        </div>
        <div class="task-section__body overflow-y-auto" :id="'tgs-task-section-body-'+section.id" style="height: calc(100vh - 265px) !important; " @scroll="handleScroll($event,section.id)" >
          <draggable :list="section.tasks" :group="{name: 'task'}" :move="moveTask" @start="taskDragStart" @end="taskDragEnd" class="section-draggable" :class="{highlight: highlight == section.id}" :data-section="section.id">
            <template v-for="task in section.tasks">
              <task-grid :task="task" :project="section.projectId" :key="task.title + templateKey + '-' + task.id" :class="[ currentTask.id == task.id ? 'active' : '']" @update-key="$emit('update-key')" @open-sidebar="openSidebar(task, section.projectId)" ></task-grid>
            </template>
            <task-grid-blank :sectionType="sectionType" :section="section" :key="'blankTaskGrid'+section.id" :ref="'blankTaskGrid'+section.id" @close-other="closeOtherBlankGrid"></task-grid-blank>
          </draggable>
        </div>
      </div>

      <div class="task-grid-section " id="task-grid-section-blank-1" v-if="(group == 'default' && $route.path.includes('/projects/')) || (group == 'department' && $route.path.includes('/tasks')) || (group == 'department' && $route.path.includes('/mytasks'))">
        <div class="section-title-wrapper d-flex justify-center flex-d-column p-05 mb-075" :class="{'active': sectionInput}" v-if="sectionType == 'singleProject'">
          <div class="title pb-05" id="tgs-new-section">
            <div v-if="!sectionInput" class="pt-025 align-center position-relative">
              <span class="text-secondary cursor-pointer d-inline-block  " @click="sectionInput = true">Add section</span>
              <span v-if="newSectionLoader" class="position-absolute" style="top:-2px;right:-2px;"><bib-spinner :scale="2.25"></bib-spinner></span>
            </div>
            <template v-else>
              <input type="text" ref="newsectioninput" class="new-section-input" placeholder="Enter text..." v-model.trim="newSectionName" @blur="() => {newSectionName = ''; sectionInput = false}" @keyup.esc="() => {newSectionName = ''; sectionInput = false}" @input="debounceCreateSection" @keyup.enter="createSection">
            </template>
          </div>
          <span class="border-bottom-gray2 my-025"></span>
        </div>
      </div>
      <div class="task-grid-section " id="task-grid-section-blank-2"></div>
      <div class="task-grid-section " style="border-left-color: transparent;" id="task-grid-section-blank-3"></div>
    </draggable>
  </div>
</template>
<script>
/*
  @vue-emits:['section-rename', 'section-delete', "create-task", "set-favorite", "mark-complete", "update-key" ],
  @vue-nuxt-emits:[ "create-task", "close-sidebar" ],
*/
import draggable from 'vuedraggable'
import { mapGetters } from 'vuex';
import _ from 'lodash'

export default {
  components: {
    draggable
  },
  data() {
    return {
      localdata: [],
      flag: false,
      ordered: [],
      loading: false,
      drag: false,
      highlight: null,
      taskDnDlist: [],
      taskDnDsectionId: null,
      sectionInput: false,
      sectionEdit: false,
      newSectionName: '',
      newSectionLoader: false,
      newTask: false,
      itemCount:9,
      newValue: [],
      allDataDisplayed: false,
      lastDisplayedIndex:{},
      dataDisplayed: false, 
      deleteBtnHover: false,
      dragOptions: {
        filter: '.non-draggable',
      },
    };
  },
  props: {
    sections: { type: Array, required: true },
    templateKey: { default: 0 },
    sectionType: { type: String },
    showNewsection: Boolean,
    group: { type: String }
  },

  computed: {
    ...mapGetters({
      project: "project/getSingleProject",
      currentTask: 'task/getSelectedTask',
      favTasks: "task/getFavTasks",
      filterViews :'task/getFilterView',
      // grid:"project/getGridType"
    }),

  },

  watch: {
    filterViews(newValue){
         return _.cloneDeep(newValue)
    },
    // sections(newVal) {
    //   this.newValue = JSON.parse(JSON.stringify(newVal))
    // },
    sections: {
      immediate: true, // Execute the watcher immediately on component mount
      deep: true, // Watch for changes in nested properties of tableData
      handler(newValue) {
        this.newValue = _.cloneDeep(newValue)
        this.newValue.map(item=>{
          if(item.id){
            return item
          }
          else {
            item['id']=this.newValue.length
            return item
          }
        })

        this.$nextTick(() => {
          this.localdata=[]
          this.allDataDisplayed=false
          this.showData();
        });
      },
    },
    sectionInput(newVal){
      if (newVal) {
        this.$nextTick(()=>{
          this.$refs.newsectioninput.focus()
        })
      }
    },
    templateKey(){
      this.newSectionLoader = false
    },
    showNewsection(newVal){
      if (newVal) {
        this.sectionInput = true
        this.$nextTick(()=>{
          this.$refs.newsectioninput.focus()
        })
      }
    }
  },
  created() {

    this.$nuxt.$on("change-duedate", payload => {
      // emitted from <task-grid>
      if (this.$route.path.includes("/projects/")) {
        this.changeDate(payload)
      }
    })
    this.$nuxt.$on("update-status-grid-task", payload => {
        this.updateStatusGridTask(payload)
    })

  },
  /*mounted() { 
    
    if(this.sectionType == "singleProject") {
      
    } 
    
    if(this.sectionType == "department") {
      
    }
    
  },*/

  methods: {
    handleScroll(event,sectionId) {
      const tableContainer = event.target;
      if (this.allDataDisplayed) {
        return; // Stop adding data if all data has been displayed
      }
      const isAtBottom = tableContainer.scrollTop + tableContainer.clientHeight+5 >= tableContainer.scrollHeight;
      if (isAtBottom) {
      this.showData(sectionId);
          }

    },
    showData(sectionId) {
      // console.log(sectionId)
      // this.localdata
      let allTasks = this.newValue?.length > 0 ? JSON.parse(JSON.stringify(this.newValue)) : JSON.parse(JSON.stringify(this.sections));
      if (sectionId === undefined) {
    //   // debugger
        this.localdata = allTasks.map(obj => {
          const newObj = {...obj}; // Create a new object with the same properties as obj
          if (newObj.tasks?.length > this.itemCount) {
            newObj.tasks = newObj.tasks.slice(0, this.itemCount);
          }
          return newObj;
        });

        allTasks.forEach(ele => {
          const newObj = JSON.parse(JSON.stringify(ele));
          this.lastDisplayedIndex[newObj.title] = this.itemCount;
        })
      }
      else {
        const selectedSection = allTasks.findIndex(ele => {
        const newObj = JSON.parse(JSON.stringify(ele));
          if (newObj.id === sectionId) {
            // console.log(newObj.id)
            return newObj;
          }
        });
      // debugger
      const breakPoint = this.lastDisplayedIndex[allTasks[selectedSection].title];

      let remainingCount = allTasks[selectedSection].tasks.length- breakPoint;

      this.lastDisplayedIndex[allTasks[selectedSection].title] += (remainingCount > this.itemCount ? this.itemCount : remainingCount);
      this.localdata[selectedSection].tasks = allTasks[selectedSection].tasks.slice(0, breakPoint + (remainingCount > this.itemCount ? this.itemCount : remainingCount));
      }

    },
    closeOtherBlankGrid($event){
      if(this.$refs.length>0) {
        for (var ref in this.$refs) {
          if(this.$refs[ref][0]?.title != $event){
            this.$refs[ref][0].newTask = false
          }
        }
      }
        
    },
    isFavorite(task) {
      let fav = this.favTasks.some(t => t.task.id == task.id)
      if (fav) {
        return { icon: "bookmark-solid", variant: "primary", text: "Remove favorite", status: true }
      } else {
        return { icon: "bookmark-solid", variant: "gray5", text: "Add to favorites", status: false }
      }
    },
    updateStatusGridTask(payload) {
            if (payload.statusId == 5) {
              this.localdata=  this.localdata.map((items) => {
                const updateTasks = items.tasks.map((task) => {
                  if (task.id == payload.id) {
                    return { ...task, statusId: 2, status: { id: 2, text: 'In-Progress' } };
                  } else {
                    return task;
                  }
                });
                return { ...items, tasks: updateTasks };
              });
            
            } else {
              this.localdata=  this.localdata.map((items) => {
                const updateTasks=items.tasks.map((task)=>{
                  if(task.id==payload.id){
                    return { ...task, statusId: 5 ,status:{id:5,text:'Done'}};
                  }
                  else {
                      return task
                  } 
                })
                return { ...items, tasks: updateTasks };
              })
      
            }
    },
    changeDate({id, field, label, value}){
      // let newDate = dayjs(value).format("D MMM YYYY");
      this.$store
        .dispatch("task/updateTask", {
          id,
          data: { [field]: value },
          user: null,
          text: `changed ${label} to ${this.$formatDate(value)}`,
        })
        .then((t) => {
            // this.updateKey();
        })
        .catch((e) => console.warn(e));
    },
    showBlankTask(sectionId) {
      // this.$emit("create-task", sectionId) //event will be captured by parent only
      // this.$nuxt.$emit("create-task", sectionId) //event will be available to all
      // console.log(sectionId)
      this.$refs[`blankTaskGrid${sectionId}`][0].showNewTask()
    },
    taskDragStart(e) {
      this.drag = true
    },

    moveTask(e) {
      this.taskDnDsectionId = +e.to.dataset.section
      this.highlight = +e.to.dataset.section

    },

    taskDragEnd(e) {
      this.highlight = false
      let sectionData = this.localdata.filter(s => s.id == e.to.dataset.section)
      this.$emit('task-dragend', { tasks: sectionData[0].tasks, sectionId: e.to.dataset.section, title: sectionData[0].title  })
    },

    moveSection(e) {
      this.highlight = +e.to.dataset.section
    },

    overdue(item) {
      return (new Date(item.dueDate) < new Date() && item.statusId != 5) ? 'danger' : 'gray5';
    },   

    openSidebar(task, projectId) {
      let fwd = this.$donotCloseSidebar(event.target.classList)
      if(!fwd) {
        this.$nuxt.$emit("close-sidebar");
        return false
      } 
      
      let project = [{
        projectId: projectId,
        project: {
          id: projectId
        }
      }]
      this.$nuxt.$emit("open-sidebar", { ...task, project });

      let el = document.getElementById("tgs-scroll")
      let scrollAmt = event.target.closest(".task-grid").offsetLeft - event.target.offsetWidth;
      el.scrollTo({
        top: 0,
        left: scrollAmt,
        behavior: 'smooth'
      });
    },

    debounceCreateSection: _.debounce(function() {
      this.createSection()
    }, 1200),

    createSection(){
      if (this.newSectionName.length > 0) {
        this.newSectionLoader = true
        this.$emit('create-section', this.newSectionName)
      }
      this.sectionInput = false
      this.newSectionName = ''
      this.$emit("update-key")
    },
    renameSection(payload){
      this.$store.dispatch("section/renameSection", {
        id: payload.id,
        data: {
          title: payload.title
        },
        text: `renamed section to "${payload.title}"`,
      }, ).then(r => {
        if (r.statusCode == 200) {
          this.$emit("update-key")
        }
      }).catch(e => console.warn(e))
    },
      beforeDestroy(){ 
    this.$nuxt.$off("update-status-grid-task");
    },
  },
};

</script>
<style lang="scss" scoped >
.smooth-dnd-container.vertical>.smooth-dnd-draggable-wrapper {
  overflow: initial;
}

.section-draggable {
  /*min-height: calc(100vh - 260px);*/
  border-radius: 3px;
}

.highlight {
  outline: 2px skyblue dashed;
  background-color: #e6e6e6;
  /*background-color: azure;*/
}

.flip-list-move {
  transition: transform 0.5s;
}

.section-title-wrapper {
  min-height: 50px;
  /*max-width: 280px;*/
  border-radius: 0.35rem;
  border: 1px dashed transparent;
  /*position: sticky;
  top: 0;
  z-index: 2;*/
  background-color: var(--bib-light);
  &.active {
    background-color: white;
    border-color: var(--bib-gray4);
  }
}

.new-section-input {
  min-height: 2rem;
  max-width: 200px;
  padding: 0.2rem 0.4rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.25rem;
  border: 1px solid var(--bib-gray1);

  &:focus {
    outline: none;
    border-color: $dark;
    box-shadow: 0 0 3px $dark-sub4;
  }
}

::v-deep {

  .bg-danger {
    .user-name {
      color: #fff
    }
  }

  .custom-control-label {
    &::before {
      width: 1.4rem;
      height: 1.4rem;
    }
  }

}

</style>
