<template>
  <client-only>
    <div id="page" class="mytask-page-wrapper ">
      <page-title title="My Tasks" :count="taskcount"></page-title>

      <user-tasks-actions :gridType="gridType" v-on:filterView="filterView" :group="groupby" @myTaskGroup="myTaskGroup($event)" @sort="sortBy" v-on:create-task="toggleSidebar($event)" v-on:add-section="toggleNewsection" @change-grid-type="($event)=>gridType = $event" @search-mytasks="searchTasks"></user-tasks-actions>

      <template v-if="taskcount > 0 || groupby == 'default'">
        <!-- <new-section-form :showNewsection="newSection" :showLoading="sectionLoading" :showError="sectionError" v-on:toggle-newsection="newSection = $event" v-on:create-section="createTodo"></new-section-form> -->
        <div v-show="gridType == 'list'" id="mytask-table-wrapper" class="h-100 mytask-table-wrapper position-relative " :style="{ 'width': contentWidth }">

          <adv-table-three :tableFields="taskFields" :tableData="localdata" :lazyComponent="true" :contextItems="contextMenuItems" @create-row="createNewTask" :newRow="newRow"  @context-open="contextOpen" @context-item-event="contextItemClick" @table-sort="sortBy" @title-click="openSidebar" @row-click="openSidebar" @update-field="updateField" :showNewsection="newSection" @toggle-newsection="toggleNewsection" @create-section="createTodo" @edit-section="renameTodo" :sectionMenu="true" @section-delete="deleteTodoConfirm($event)" @section-dragend="todoDragEnd" @row-dragend="taskDragEnd" :drag="groupby == 'default'" :key="templateKey" :editSection="groupby" :filter="filterViews" ></adv-table-three>
              
          <!-- <loading :loading="loading"></loading> -->

        </div>

        <div v-show="gridType == 'grid'" id="tgs-scroll" class="bg-light grid-wrapper h-100 position-relative" :style="{ 'width': contentWidth }">
          <draggable v-model="localdata" :disabled="groupby != 'default'" class="d-flex grid-content" :move="moveTodo" @end="gridSectionDragend" handle=".section-drag-handle">
            <div v-if="newSection" class="task-grid-section">
              <div class="w-100 d-flex justify-between" style="margin-bottom: 10px">
                <input type="text" ref="newsectioninput" class="editable-input" placeholder="Enter title" @input="debounceNewSection($event.target.value, $event)" @focus.stop="">
              </div>
            </div>
            <div class="task-grid-section" v-for="(todo, index) in localdata" :key="index + viewName + '-' + key" style="padding-bottom: 0px !important;">
              <div class="w-100 d-flex justify-between bg-light" style="margin-bottom: 10px; position: sticky; top: 0; z-index: 2;">
                <task-grid-section-title :section="todo" @update-title="renameTodo"></task-grid-section-title>
                <div class="d-flex align-center section-options" :id="'tg-section-options-'+todo.id">
                  <div class="cursor-pointer mx-05 d-flex align-center" :id="'tg-section-addtask-'+todo.id" v-on:click.stop="showBlankTask(todo.id)">
                    <bib-icon icon="add" variant="gray5" :scale="1.25"></bib-icon>
                  </div>
                  <bib-popup pop="elipsis" icon-variant="gray5" :scale="1.1">
                    <template v-slot:menu>
                      <div :id="'tgs-list'+todo.id" class="list">
                        <span class="list__item" :id="'tgs-list-1'+todo.id" v-on:click.stop="showBlankTask(todo.id)">
                          <div class="d-flex align-center" :id="'tgs-list-flex-1'+todo.id">
                            <bib-icon icon="add"></bib-icon>
                            <span class="ml-05" :id="'tgs-list-add'+todo.id">Add task</span>
                          </div>
                        </span>
                        <hr>
                        <span v-if="todo.isDeletable" class="list__item list__item__danger" :id="'tgs-list-3'+todo.id" v-on:click="deleteTodoConfirm(todo)" @mouseenter="deleteBtnHover = true" @mouseleave="deleteBtnHover = false">
                          <bib-icon icon="trash" :variant="deleteBtnHover ? 'white' : 'danger'"></bib-icon>
                          <span :id="'tgs-list-del'+todo.id" class="ml-05">Delete section</span>
                        </span>
                      </div>
                    </template>
                  </bib-popup>
                </div>
              </div>
              <div class="task-section__body h-100"  style="height: calc(100vh - 230px) !important;overflow: hidden">
                <draggable :list="todo.tasks" :disabled="groupby != 'default'" :group="{name: 'task'}" :move="moveTask" @start="taskDragStart" @end="gridTaskDragend"  style="height: calc(100vh - 230px) !important;overflow: auto" class="section-draggable h-100" :class="{highlight: highlight == todo.id}" :data-section="todo.id">
                  <template v-for="(task, index) in todo.tasks">
                    <task-grid :task="task" :key="task.id + '-' + index + key" :class="[ currentTask.id == task.id ? 'active' : '']" @update-key="updateKey" @open-sidebar="openSidebar" @user-picker="showUserPicker" ></task-grid>
                  </template>
                 <task-grid-blank :sectionType="sectionType" :section="todo" :initialData="initialData" :key="'blankTaskGrid'+todo.id" :ref="'blankTaskGrid'+todo.id" @close-other="closeOtherBlankGrid"></task-grid-blank>
                </draggable>
              </div>
            </div>
            <div class="task-grid-section " id="task-grid-section-blank-2"></div>
            <div class="task-grid-section " id="task-grid-section-blank-3" style="border-left-color: transparent;"></div>
            <!-- <div class="task-grid-section " id="task-grid-section-blank-4"></div> -->
          </draggable>
        </div>
      </template>

      <no-data v-else></no-data>
          
      <!-- user-picker for board view -->
      <user-picker :show="userPickerOpen" :coordinates="popupCoords" @selected="updateAssignee({label: 'Assignee', field:'userId', value: $event.id, historyText: $event.label})" @close="userPickerOpen = false"></user-picker>

      <bib-modal-wrapper v-if="todoConfirmModal" title="Delete section" @close="todoConfirmModal = false">
        <template slot="content">
            <div class="d-grid gap-2 text-center" style="grid-template-columns: repeat(2, 1fr)">
              <p class="text-secondary">Delete Section but keep the tasks as is.</p>
              <p class="text-secondary">Delete Section and delete the tasks </p>
            </div>
        </template>
        <template slot="footer">
            <div class="justify-around">
              <bib-button label="Keep tasks" variant="primary-24" pill @click="deleteTodo(true)"></bib-button>
              <bib-button label="Delete tasks" variant="danger" pill @click="deleteTodo(false)"></bib-button>
            </div>
        </template>
      </bib-modal-wrapper>

      <alert-dialog v-show="alertDialog" :message="alertMsg" @close="alertDialog = false"></alert-dialog>

      <!-- <loading :loading="loading"></loading> -->

      <!-- delete confirm -->
      <bib-modal-wrapper v-if="taskDeleteConfirm" title="Delete task" @close="() => taskDeleteConfirm = false">
        <template slot="content">
          <p>Task will be deleted permanently and wont be recoverable</p>
          <loading :loading="loading"></loading>
        </template>
        <template slot="footer">
            <div v-show="!loading" class="justify-between gap-1">
              <bib-button label="Cancel" variant="secondary" pill @click.native.stop="() => taskDeleteConfirm = false"></bib-button>
              <bib-button label="Delete" variant="danger" pill @click.native.stop="deleteTask"></bib-button>
            </div>
        </template>
      </bib-modal-wrapper>

        <bib-popup-notification-wrapper>
          <template #wrapper>
            <bib-popup-notification v-for="(msg, index) in popupMessages" :key="index" :message="msg.text" :variant="msg.variant" autohide="5000">
            </bib-popup-notification>
          </template>
        </bib-popup-notification-wrapper>

    </div>
  </client-only>
</template>

<script>
import _ from 'lodash'
import draggable from 'vuedraggable'
import { USER_TASKS, TASK_CONTEXT_MENU, FIELDS_LOG } from "../../config/constants";
import { mapGetters } from 'vuex';
import { unsecuredCopyToClipboard } from '~/utils/copy-util.js'

export default {
  name: "MyTasks",
  components: {
    draggable
  },
  data() {
    return {
      taskFields: USER_TASKS,
      localdata: [],
      initialData: [],
      loading: false,
      gridType: 'list',
      viewName: null,
      sortName: null,
      dueDateSort: 'asc',
      startDateSort: 'asc',
      departmentSort: 'asc',
      prioritySort: 'asc',
      statusSort: 'asc',
      titleSort: 'asc',
      userSort: 'asc',
      projectSort: 'asc',
      difficultySort: 'asc',
      flag: false,
      key: 11,
      templateKey: 0,
      newSection: false,
      sectionLoading: false,
      sectionError: "",
      highlight: null,
      taskDnDsectionId: null,
      taskDnDlist: [],
      renameModal: false,
      todoId: null,
      todoTitle: null,
      activeTask: {},
      taskToDelete: {},
      taskContextMenu: false,
      contextMenuItems: TASK_CONTEXT_MENU,
      popupCoords: {},
      popupMessages: [],
      userPickerOpen: false,
      datePickerOpen: false,
      datepickerArgs: { label: "", field: ""},
      // statusPickerOpen: false,
      // priorityPickerOpen: false,
      // deptPickerOpen: false,
      alertDialog: false,
      alertMsg:"",
      contentWidth: "100%",
      // tasksKey: 'tasks',
      groupby: "default",
      dragTable: true,
      deleteBtnHover: false,
      todoConfirmModal: false,
      todoToDelete: {},
      retainTasks: null,
      newRow: {
        show: false,
        id: "",
        title: "",
        userId: "",
        statusId: null,
        priorityId: null,
        departmentId: null,
        startDate: "",
        sectionId:null,
        dueDate: "",
        department: "",
        description: "",
        budget: "",
        text: "",
      },
      sectionType:"myTask",
      taskDeleteConfirm: false
    }
  },

  computed: {
    ...mapGetters({
      todos: "todo/getAllTodos",
      favTasks: 'task/getFavTasks',
      currentTask: 'task/getSelectedTask',
      teamMembers: "user/getTeamMembers",
      sidebar: "task/getSidebarVisible",
      loggedUser: "user/getUser2",
      filterViews :'task/getFilterView',
      expandVisible:"task/getExpandVisible",
      grid:"todo/getGridType",
      taskcount: "todo/getTaskCount",
      filter: "task/getFilterView",
      oldlog: "task/getTaskHistory",
    }),
 
    // taskcount(){
    //   return this.todos.reduce((acc, td) => acc + td.tasks.length, 0)
    // },
  },

  watch: {
    taskcount(newValue){
      return _.cloneDeep(newValue)
    },
      filterViews(newVal) {
          return _.cloneDeep(newVal)
      },
    todos(newVal) {
      let localTodos = _.cloneDeep(newVal)
      localTodos.forEach(function(todo) {
        todo["tasks"] = todo.tasks?.sort((a, b) => a.tOrder - b.tOrder);
      })
      
      this.localdata = localTodos
    },

    gridType() {
      this.$store.commit('todo/gridType',{gridType:this.gridType})
      localStorage.setItem('mygrid', this.gridType)
      this.updateKey();
      // this.key++;
    },
    sidebar(newVal){
      const page = document.getElementById("page")
      this.$nextTick(() => {
        const panel = document.getElementById("side-panel-wrapper")
        if (this.sidebar && page) {
          this.contentWidth = (page.scrollWidth - panel.offsetWidth) + 'px'
        } else {
          this.contentWidth = '100%'
        }
      });
    }
  },

  created() {
    if (process.client) {
      this.$nuxt.$on("change-duedate", payload => {
        // emitted from <task-grid>
        this.updateDuedate(payload)
      }) 
      this.$nuxt.$on("gridNewTask", this.handleNewTask);
      this.$nuxt.$on("update-key", (payload) => {
        this.updateKey()
      });
      this.$nuxt.$on("refresh-table", () => {
        // console.log("mytask_created_on-refresh")
        this.updateKey();
      });
      

      if (sessionStorage.getItem("newTask")) {
        this.toggleSidebar(false)
        // this.$nuxt.$emit("open-sidebar", {userId: this.loggedUser.Id});
        _.delay(function () {
          sessionStorage.removeItem("newTask")
        }, 5000)
      }
    }
  },

  mounted() {
    
    /*this.$store.dispatch("todo/fetchTodos", {filter: "all"}).then(res => {
      this.localdata = res.data
    }).catch(e => console.warn(e))*/
    if(sessionStorage.getItem('noAccess')) {
      this.$store.commit('task/setExpandVisible', true)
      this.popupMessages.push({ text: "Project/Task is unavailable", variant: "primary-24" });
      setTimeout(() => {
        sessionStorage.clear()
      },2000)
    }

    if (this.todos.length<=0) {
      this.updateKey();
    }
    // if(this.todos)
    for(let field of this.taskFields) {
      if(field.header_icon) {
        field.header_icon.isActive = false;
      }
    }
    // this.$store.dispatch("todo/setMyfetchTodos")
      setTimeout(() => {
        if(localStorage.getItem('mygrid')!=null){
          if(localStorage.getItem('mygrid')=='grid'){
            this.gridType='grid'
          }
          if(localStorage.getItem('mygrid')=='list')
            this.gridType='list'
        }
        else {
          this.gridType=this.grid
        }

      }, 300);
      this.$store.commit('todo/setGroupBy',"default")
  },

  beforeDestroy(){ 
  
    this.$nuxt.$off("refresh-table");
    this.$nuxt.$off("update-key");
    this.$nuxt.$off("gridNewTask", this.handleNewTask);
    sessionStorage.clear();
    this.initialData = []
  },

  async asyncData({$axios, app,store,context}) {
    const token = app.$cookies.get(process.env.SSO_COOKIE_NAME)

    // console.log(token)
    const filter = store.getters['task/getFilterView']
    const response = await $axios.get('/todo/all', {
      headers: {
        Authorization: `Bearer ${token}`,
        Filter: filter,
      },
    });

    // console.log("response",response)
    store.dispatch('todo/setTodos', response.data.data)
    return { localdata: response.data.data, initialData: response.data.data }
    
  },

  methods: {

    handleNewTask (payload,param){
        if (this.localdata.length>0) {
          let gridData=[...this.localdata]
              if(param=="/mytasks"){  
                  if(this.groupby=="default") 
                      {
                            if(payload.todoId) {
                              let exist_item= gridData. find((item)=>item.id==payload.todoId)
                              if(exist_item) {
                                let index = gridData. findIndex((item) => item.id==payload.todoId);
                                gridData[ index].tasks.push(payload);
                                this.localdata=gridData
                              }
                            }
                            else {
                              let exist_item= gridData.find((item)=>item.title=="Recently Assigned")
                              if(exist_item) {
                                let index = gridData.findIndex((item) => item.title == "Recently Assigned");
                                gridData[index].tasks.push(payload);
                                this.localdata=gridData

                              }
                            }

                          // else
                          // {
                          //   this.$nuxt.$emit("refresh-table");
                            
                          // }
                          this.$store.commit("todo/setAddTaskCount")
                  
                      }
                      else 
                      {
                          this.changeIntoGroupBy(payload,this.myTaskGroupBy)
                          this.$store.commit("todo/setAddTaskCount")
                      }
              }
            //  if (param)
        }
        else 
        {
          this.updateKey();
          // this.$store.commit("todo/setAddTaskCount")
        }

    },
    changeIntoGroupBy (payload,groupBy) {
      if (this.localData?.[0]?.tasks?.length>0) {
        //To groupBy, change the localData
        this.localData = this.localData.reduce((acc, ele) => {
          return [...acc, ...ele.tasks];
        }, []);
        //insert the newTask
        if (!this.localData.some(item => item.id === payload.id)) {
          this.localData.push(payload);
        }
        //change the localData into groupBy
        this.localData=this.$groupBy( this.localData,groupBy)
      
      } else {
        this.updateKey();
      }  
    },
    //group by
    myTaskGroup($event) {
      if($event == 'default') {
        this.groupby = 'default'
        this.dragTable = true;
      } else {
        this.groupby = $event
        this.dragTable = false;
      }

      this.$store.commit('todo/setGroupBy', this.groupby)
      // this.$store.commit('todo/groupMyTasks',{sName:this.groupby,team:this.teamMembers })
      this.updateKey()
      },
    checkActive(sortName) {
      for(let i=0; i<this.taskFields.length; i++) {
          if(this.taskFields[i].header_icon) {
            this.taskFields[i].header_icon.isActive = false
          }

          if(this.taskFields[i].header_icon && this.taskFields[i].key == sortName) {
            this.taskFields[i].header_icon.isActive = true
          } 
      }
      this.templateKey++;
    },

    taskRightClick(payload) {
      this.taskContextMenu = true
      this.userPickerOpen = false
      this.datePickerOpen = false
      const { event, task } = payload
      this.activeTask = task;
      this.$store.dispatch('task/setSingleTask', task)
      this.popupCoords = { left: event.pageX + 'px', top: event.pageY + 'px' }
    },

    openSidebar(task, scroll) {
      let fwd = this.$donotCloseSidebar(event.target.classList)
      if (!fwd) {
        this.$nuxt.$emit("close-sidebar");
        return false
      }
      this.$nuxt.$emit("open-sidebar", { ...task, scrollId: scroll });

      let el = document.getElementById("tgs-scroll")
      if (event.target.closest(".task-grid")) {
        let scrllLeft = event.target.closest(".task-grid").offsetLeft - event.target.offsetWidth;
        let scrllTop = event.target.closest(".task-grid").offsetTop - event.target.offsetHeight;
        el.scrollTo({
          top: scrllTop,
          left: scrllLeft,
          behavior: 'smooth'
        });
      }
    },

    closePopups() {
      this.taskContextMenu = false
      this.userPickerOpen = false
      this.datePickerOpen = false
      this.activeTask = {}
    },
    contextOpen(item){
      if(this.$CheckFavTask(item.id)){
       this.contextMenuItems=this.contextMenuItems.map(item => item.label === "Add to Favorites" ? { ...item, label: "Remove favorite"} : item);
      }
      else{
        this.contextMenuItems=this.contextMenuItems.map(item => item.label === "Remove favorite" ? { ...item, label: "Add to Favorites"} : item);
      }
      if(item.statusId==5){
       this.contextMenuItems=this.contextMenuItems.map(item => item.label === "Mark Complete" ? { ...item, label: "Completed"} : item);
      }
      else {
         this.contextMenuItems=this.contextMenuItems.map(item => item.label === "Completed" ? { ...item, label: "Mark Complete"} : item);
      }
      this.$store.dispatch("task/setSingleTask", item)
    },
    contextItemClick(key, item) {
      // console.log(...arguments)
      switch (key) {
        case 'done-task':
          this.taskMarkComplete(item)
          break;
        case 'fav-task':
          this.taskSetFavorite(item)
          break;
        case 'delete-task':
          // this.deleteTask(item)
          this.taskDeleteConfirm = true
          this.taskToDelete = item
          break;
        case 'copy-task':
          this.copyTaskLink(item);
          break;
        case 'gotoTeam':
          this.$nuxt.$emit('add-member-to-task')
          break;
        case 'gotoComment':
          this.openSidebar(item, 'task_conversation')
          break;
        case 'gotoSubtask':
          this.openSidebar(item, 'task_subtasks')
          break;
        case 'gotoFiles':
          this.openSidebar(item, 'task_files')
          break;
        default:
          this.alertDialog = true
          this.alertMsg = "no task assigned"
          break;
      }
    },

    showUserPicker(payload){
      this.closeAllPickers()
      this.userPickerOpen = true
      this.popupCoords = { left: event.clientX + 'px', top: event.clientY + 'px' }
      this.activeTask = payload.task
    },
    showDatePicker(payload){
      // payload consists of event, task, label, field
      this.closeAllPickers()
      this.datePickerOpen = true
      this.popupCoords = { left: event.clientX + 'px', top: event.clientY + 'px' }
      this.activeTask = payload.task
      this.datepickerArgs.field = payload.field || 'dueDate'
      this.datepickerArgs.label = payload.label || 'Due date'
    },
    /*showStatusPicker(payload){
      this.closeAllPickers()
      this.statusPickerOpen = true
      this.popupCoords = { left: event.clientX + 'px', top: event.clientY + 'px' }
      this.activeTask = payload.task
    },
    showPriorityPicker(payload){
      this.closeAllPickers()
      this.priorityPickerOpen = true
      this.popupCoords = { left: event.clientX + 'px', top: event.clientY + 'px' }
      this.activeTask = payload.task
    },
    showDeptPicker(payload){
      this.closeAllPickers()
      this.deptPickerOpen = true
      this.popupCoords = { left: event.clientX + 'px', top: event.clientY + 'px' }
      this.activeTask = payload.task
    },*/
    closeAllPickers(){
      this.taskContextMenu = false
      this.userPickerOpen = false
      this.datePickerOpen = false
      // this.statusPickerOpen = false
      // this.priorityPickerOpen = false
      // this.deptPickerOpen = false
      this.activeTask = {}
    },

    // task context menu methods ----------------------------------------

    taskSetFavorite(task) {
      this.loading = true
      let isFav = this.favTasks.some((f) => f.taskId == task.id)

      if (isFav) {
        this.$store.dispatch("task/removeFromFavorite", { id: task.id })
          .then(msg => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
            this.loading = false
          })
          .catch(e => {
            this.loading = false
            console.log(e)
          })
      } else {
        this.$store.dispatch("task/addToFavorite", { id: task.id })
          .then(msg => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
            this.loading = false
          })
          .catch(e => {
            this.loading = false
            console.log(e)
          })
      }
    },

    updateField(payload){
      const { item, label, field, value, historyText } = payload
      let data = { [field]: value }
      let oldlog
      let toBeLogged = false
        // console.log(payload)
        this.$store.dispatch("task/fetchHistory", item).then(h => {
          // console.log(h)
          oldlog = this.$oldLog(label)
    
          if(field == "dueDate" && item.startDate){
            // console.log(field, value)
            if(value=="Invalid Date"){
              data = { [field]: null }
            } else {
              data = { [field]: value }
            }
          }
          
          if(field == "startDate" && item.dueDate){
            if(value=="Invalid Date"){
              data = { [field]: null }
            } else {
              data = { [field]: value }
            }   
          }

          // let fieldsLog = ["dueDate", "statusId", "difficultyId", "departmentId", "priorityId"]
        if (FIELDS_LOG.includes(field)) {
          toBeLogged = true
        } else {
          toBeLogged = false
        }
        // console.log(field, toBeLogged, oldlog)
        
          if(this.groupby != 'default') {
            this.$store.dispatch("task/updateTask", {
              id: payload.id,
              projectId: item.project[0]?.projectId || null,
              data,
              text: historyText,
              toBeLogged,
              oldLog: oldlog ? {id: oldlog.id, userId: oldlog.userId} : null
            })
          } else {
            this.$store.dispatch("task/updateTask", {
              id: payload.id,
              projectId: item.project[0]?.projectId || null,
              data,
              text: historyText,
              toBeLogged,
              oldLog: oldlog ? {id: oldlog.id, userId: oldlog.userId} : null
            })
          }
        })
    },

    taskMarkComplete(task) {
      this.$store.dispatch('task/updateTaskStatus', task)
        .then((d) => {
          this.updateKey("Marked as complete")
          this.$store.dispatch("task/setSingleTask", d)
        }).catch(e => {
          console.log(e)
        })
    },

    updateAssignee(payload){
      // console.log(payload)
      const { label, field, value, historyText } = payload
      let user
      if (field == "userId" && value != '') {
        user = this.teamMembers.filter(t => t.id == value)
      } else {
        user = null
      }

      this.userPickerOpen = false

      this.$store.dispatch("task/updateTask", {
        id: this.activeTask.id,
        data: { [field]: value},
        user,
        text: `changed ${label} to ${historyText}`
      })
        .then(t => {
          this.updateKey()
        })
        .catch(e => console.warn(e))
    },
    showBlankTask(sectionId) {
      // this.$emit("create-task", sectionId) //event will be captured by parent only
      // this.$nuxt.$emit("create-task", sectionId) //event will be available to all
      // console.log(sectionId)
      this.$refs[`blankTaskGrid${sectionId}`][0].showNewTask()
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
    updateDuedate({id, field, label, value, oldlog}){
      // console.log(...arguments)
      let toBeLogged = false;
      
      if (FIELDS_LOG.includes(field)) {
          toBeLogged = true
        } else {
          toBeLogged = false
        }

      this.$store.dispatch("task/updateTask", {
        id,
        data: { [field]: value},
        user: null,
        text: `changed ${label} to ${this.$formatDate(value)}`,
        toBeLogged,
        oldLog: oldlog || null
      })
        .then(t => {
          this.updateKey()
        })
        .catch(e => console.warn(e))
    },

    deleteTask(task) {
      if (this.taskToDelete) {
        this.$store.dispatch("task/deleteTask", this.taskToDelete)
        .then(t => {
          if (t.statusCode == 200) {
            // this.updateKey(t.message)
            this.popupMessages.push({ text: t.message, variant: "primary-24" })
            this.$nuxt.$emit("delete_update_table",this.taskToDelete,this.$route.fullPath)
          } else {
            this.popupMessages.push({ text: t.message, variant: "primary-24" })
            console.warn(t.message);
          }
        })
        .catch(e => {
          console.warn(e)
        })
        .then(() => {
          this.taskToDelete = {}
          this.taskDeleteConfirm = false
        })
      } else {
        this.popupMessages.push({ text: "Action cancelled", variant: "primary-24" })
      }
    },
    createNewTask(proj, section) {
      proj.group = this.groupby;
      proj.status = null
      proj.statusId = null
      proj.priority = null
      proj.priorityId = null
      proj.departmentId = null;
      proj.department = null;
      proj.difficultyId = null;
      proj.user = [{
        id: this.loggedUser.Id,
        email: this.loggedUser.Email,
        firstName: this.loggedUser.FirstName,
        lastName: this.loggedUser.LastName
      }]
      proj.userId = this.loggedUser.Id
      proj.projectId=null
      // if(this.groupby=="default") {
      //   proj.todoId =section.tasks&&section.tasks[0]?section.tasks[0]?.todoId: section.id
      // }

      if(this.groupby=='default') {
        let foundTodo = this.initialData.find((el) => el.title == section.title)
        proj.todoId = foundTodo.id
      } else {
        let recentlyTodo = this.initialData.find((el) => el.title == "Recently Assigned")
        proj.todoId = recentlyTodo.id
      }

      if(this.groupby == "priority"){
        proj.priority = section.tasks[0]?.priority
        proj.priorityId = section.tasks[0]?.priorityId
     
      }
      if(this.groupby == "status"){
        proj.status = section.tasks[0]?.status
        proj.statusId = section.tasks[0]?.statusId
      }
      if(this.groupby=="assignee"){
        proj.user=[section.tasks[0]?.user]
        proj.userId=section.tasks[0]?.userId
      }
      if(this.groupby=="difficulty"){
        proj.difficultyId = section.tasks[0]?.difficultyId
      }
      if(this.groupby == "department"){
        proj.department = section.tasks[0]?.department
        proj.departmentId = section.tasks[0]?.departmentId
      }
      delete proj.show
      delete proj.sectionId
      this.$store.dispatch("task/createTask", {
          ...proj,
          text: `created task ${proj.title}`,
        })
        .then((t) => {
          // console.log("res",t.data)
          this.resetNewRow();
          this.$nuxt.$emit("newTask",t.data,this.$route.fullPath)
        })
        .catch((e) => {
          console.warn(e);
        });
    },
    resetNewRow() {
      this.newRow = {
        show: false,
        id: "",
        title: "",
   
        statusId: null,
        status: null,
        priority: null,
        priorityId: null,
        departmentId: null,
        department: null,
        startDate: "",
        dueDate: "",
        description: "",
        budget: "",
        text: "",
      };
    },
    // createNewTask(item,section){
    //   console.log(item)
    //   let taskdata = item
    //   taskdata.todoId = this.groupby ? null : section.id
    //   taskdata.user = [{
    //     id: this.loggedUser.Id,
    //     email: this.loggedUser.Email,
    //     firstName: this.loggedUser.FirstName,
    //     lastName: this.loggedUser.LastName
    //   }]
    //   taskdata.userId=this.loggedUser.Id
    //   // console.log(taskdata)
    //   this.$store.dispatch("task/createTask", taskdata)
    //   .then(t => {
    //     console.log("$$$$",t)
    //     this.$nuxt.$emit("newTask",t.data,this.$route.fullPath)
    //   })
    //   .catch(e => console.warn(e))
    // },

    updateKey($event) {
      if ($event) {
        this.popupMessages.push({ text: $event, variant: "primary-24" })
      }
      this.$store.dispatch("todo/fetchTodos", { filter: this.filterViews,sName:this.groupby}).then((res) => {
        if (res.statusCode == 200) {
          this.key += 1
          this.templateKey += 1
        }
      })
    },
    
    toggleNewsection(flag) {
      // console.log(flag)
      this.newSection = flag ? false : true

    },

    debounceNewSection: _.debounce(function(value, event) {
      if (value) {
        event.target.classList.remove("error")
        this.createTodo(value)
      } else {
        console.warn("Title cannot be left blank")
        event.target.classList.add("error")
      }
    }, 800),

    async createTodo($event) {
      let tTodos=JSON.parse(JSON.stringify(this.localdata))
      let tempTodos = tTodos.map((el, index) => {
        el.uOrder = index+1
        return el
      })

      tempTodos.unshift({title: $event, userId: JSON.parse(localStorage.getItem("user")).sub, uOrder: 0 })

      const todo = await this.$store.dispatch("todo/createTodo", {
        userId: JSON.parse(localStorage.getItem("user")).sub,
        title: $event,
        data: tempTodos,
      })
      if (todo.statusCode == 200) {
        this.newSection = false
        this.$store.dispatch("todo/fetchTodos", { filter:this.filterViews }).then(res => {
          this.initialData = res.data
        } )
      } else {
        console.warn(todo)
      }
    },

    renameTodo(payload) {
      this.$store.dispatch("todo/renameTodo", {
        id: payload.id,
        data: {
          title: payload.title
        },
        text: `renamed section to "${payload.title}"`,
      }).then(res => {
        if (res.statusCode == 200) {
          this.updateKey()
        } else { 
          this.alertDialog = true
          this.alertMsg = "Error -> "+ res.statusCode
        }
      }).catch(e => console.warn(e))
    },

    deleteTodoConfirm(todo){
      this.todoConfirmModal = true
      this.todoToDelete = todo
    },

    deleteTodo(retainTasks) {
      this.$store.dispatch("todo/deleteTodo", {id: this.todoToDelete.id, title: this.todoToDelete.title, retainTasks})
        .then((d) => {
          // console.log(d)
          this.updateKey(d.message)
        })
        .catch(e => {
          console.warn(e)
        }).then(() => {
          this.todoConfirmModal = false
          this.todoToDelete = {}
        })
    },

    taskDragStart(e) {
      this.drag = true
    },

    moveTask(e) {
      this.taskDnDsectionId = +e.to.dataset.section
      this.highlight = +e.to.dataset.section
    },

    gridTaskDragend(e){
      let sectionData = this.localdata.filter(
        (s) => s.id == e.to.dataset.section
      );
      this.taskDragEnd({
        tasks: sectionData[0].tasks,
        sectionId: e.to.dataset.section,
      });
    },

    taskDragEnd: _.debounce(async function(payload) {
      let dragData=_.cloneDeep(payload)
      this.highlight = null
      dragData.tasks.forEach((e, i) => {
        e.tOrder = i
      })

      if(this.groupby != 'default') {
        this.updateKey();
      } else {
        let taskDnD = await this.$axios.$put("/todo/crossTodoDragDrop", { data: dragData.tasks, todoId: dragData.sectionId }, {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("accessToken"),
            "Content-Type": "application/json"
          }
        })

        if (taskDnD.statusCode != 200) {
          this.alertDialog = true
          this.alertMsg = taskDnD.message
        }

        this.$store.dispatch("todo/fetchTodos", { filter: 'all' }).then((res) => {
          if (res.statusCode == 200) {
            this.key += 1
          }
        })
      }
    }, 400),

    moveTodo(e) {
      this.highlight = +e.to.dataset.section
    },

    gridSectionDragend(e){
      this.todoDragEnd(this.localdata)
    },

    todoDragEnd: _.debounce(async function(todos) {
      this.loading = true;
      todos.forEach((el, i) => {
        el.uOrder = i
      })

      if(this.groupby != 'default') {
        this.updateKey();
      } else {

        let todoDnD = await this.$axios.$put("/todo/dragdrop", { data: todos }, {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("accessToken"),
            "Content-Type": "application/json"
          }
        })

        if (todoDnD.statusCode != 200) {
          this.alertDialog = true
          this.alertMsg = taskDnD.message
        }

        this.$store.dispatch("todo/fetchTodos", { filter: 'all' }).then((res) => {
          if (res.statusCode == 200) {
            this.key += 1
            this.loading = false;
          }
        })
      }

    }, 600),

    filterView($event) {
      this.$store.commit('task/setFilterView', {filter:$event})
      this.$store.dispatch("todo/fetchTodos", { filter: $event,sName:this.groupby})
      // this.$store.dispatch("todo/fetchTodos", { filter: this.filterViews,sName:this.groupby}).then((res) => {
      //   if (res.statusCode == 200) {
      //     this.key += 1
      //     this.templateKey += 1
      //   }
      // })
      // this.$store.commit("todo/getFilterMyTasks",{filter:$event, groupBy:this.groupby})

    },

    resetOtherSorts(sName) {

      switch (sName) {
        case 'title':
          this.statusSort = 'asc';
          this.userSort = 'asc';
          this.prioritySort = 'asc';
          this.departmentSort = 'asc';
          this.startDateSort = 'asc';
          this.dueDateSort = 'asc';
          this.difficultySort = 'asc';
          this.projectSort = 'asc';
          break;
      
        case 'userId':
          this.statusSort = 'asc';
          this.titleSort = 'asc';
          this.prioritySort = 'asc';
          this.departmentSort = 'asc';
          this.startDateSort = 'asc';
          this.dueDateSort = 'asc';
          this.difficultySort = 'asc';
          this.projectSort = 'asc';
          break;
        
        case 'status':
          this.titleSort = 'asc';
          this.userSort = 'asc';
          this.prioritySort = 'asc';
          this.departmentSort = 'asc';
          this.startDateSort = 'asc';
          this.dueDateSort = 'asc';
          this.difficultySort = 'asc';
          this.projectSort = 'asc';
          break;

        case 'priority':
          this.statusSort = 'asc';
          this.userSort = 'asc';
          this.titleSort = 'asc';
          this.departmentSort = 'asc';
          this.startDateSort = 'asc';
          this.dueDateSort = 'asc';
          this.difficultySort = 'asc';
          this.projectSort = 'asc';
          break;

        case 'department':
          this.statusSort = 'asc';
          this.userSort = 'asc';
          this.prioritySort = 'asc';
          this.titleSort = 'asc';
          this.startDateSort = 'asc';
          this.dueDateSort = 'asc';
          this.difficultySort = 'asc';
          this.projectSort = 'asc';
          break;

        case 'startDate':
          this.statusSort = 'asc';
          this.userSort = 'asc';
          this.prioritySort = 'asc';
          this.departmentSort = 'asc';
          this.titleSort = 'asc';
          this.dueDateSort = 'asc';
          this.difficultySort = 'asc';
          this.projectSort = 'asc';
          break;

        case 'dueDate':
          this.statusSort = 'asc';
          this.userSort = 'asc';
          this.prioritySort = 'asc';
          this.departmentSort = 'asc';
          this.startDateSort = 'asc';
          this.titleSort = 'asc';
          this.difficultySort = 'asc';
          this.projectSort = 'asc';
          break;

        case 'project': 
          this.statusSort = 'asc';
          this.userSort = 'asc';
          this.prioritySort = 'asc';
          this.departmentSort = 'asc';
          this.startDateSort = 'asc';
          this.dueDateSort = 'asc';
          this.difficultySort = 'asc';
          this.titleSort = 'asc';
          break;

        case 'difficultyId':
          this.statusSort = 'asc';
          this.userSort = 'asc';
          this.prioritySort = 'asc';
          this.departmentSort = 'asc';
          this.startDateSort = 'asc';
          this.dueDateSort = 'asc';
          this.titleSort = 'asc';
          this.projectSort = 'asc';
          break;

        default:
          this.statusSort = 'asc';
          this.userSort = 'asc';
          this.prioritySort = 'asc';
          this.departmentSort = 'asc';
          this.startDateSort = 'asc';
          this.dueDateSort = 'asc';
          this.difficultySort = 'asc';
          this.projectSort = 'asc';
          this.titleSort = 'asc';
          break;
      }
    },

    // Sort By Action List
    sortBy($event) {
      // sort by title
      this.$store.dispatch("todo/fetchTodos", { filter: this.filterViews,sName:this.groupby}).then((res) => {
        
        let newArr = JSON.parse(JSON.stringify(this.localdata))
          if ($event == 'title') {
          
              if (this.titleSort == "asc") {

                  newArr.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.title && b.title) {
                        return a.title.localeCompare(b.title)
                      }
                    })
                  })

                  this.titleSort = 'desc'

              } else {

                newArr.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.title && b.title) {
                        return b.title.localeCompare(a.title)
                      }
                    })
                  })
                this.titleSort = 'asc'
              }

              this.resetOtherSorts($event);
              this.localdata = newArr; 
          }

          // sort By Project
          if ($event == 'project') {
          
              let newArr1 = [];

              for (let i = 0; i < newArr.length; i++) {
                newArr1.push(newArr[i]);
                let tNewArr = []
                for(let j=0; j<newArr[i].tasks.length; j++) {
                  if (newArr[i].tasks[j].project.length > 0) {
                    tNewArr.unshift(newArr[i].tasks[j])
                  } else {
                    tNewArr.push(newArr[i].tasks[j])
                  }
                }
                newArr1[i]["tasks"] = tNewArr;
              }

              if (this.projectSort == "asc") {

                  newArr1.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.project.length > 0 && b.project.length > 0) {
                        return a.project[0].project.title.localeCompare(b.project[0].project.title)
                      }
                    })
                  })

                  this.projectSort = 'desc'

              } else {

                newArr1.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.project.length > 0 && b.project.length > 0) {
                        return b.project[0].project.title.localeCompare(a.project[0].project.title)
                      }
                    })
                  })

                  this.projectSort = 'asc'
              }

              this.resetOtherSorts($event)
              this.localdata = newArr1;  
          }


          // sort By Status
          if ($event == "status") {

              let newArr2 = [];

              for (let i = 0; i < newArr.length; i++) {
                newArr2.push(newArr[i]);
                let tNewArr = []
                for(let j=0; j<newArr[i].tasks.length; j++) {
                  if (newArr[i].tasks[j].statusId) {
                    tNewArr.unshift(newArr[i].tasks[j])
                  } else {
                    tNewArr.push(newArr[i].tasks[j])
                  }
                }
                newArr2[i]["tasks"] = tNewArr;
              }

              if (this.statusSort == "asc") {

                  newArr2.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.statusId && b.statusId) {
                        return a.status.text.localeCompare(b.status.text)
                      }
                    })
                  })

                  this.statusSort = 'desc'

              } else {

                newArr2.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.statusId && b.statusId) {
                        return b.status.text.localeCompare(a.status.text)
                      }
                    })
                  })

                  this.statusSort = 'asc'
              }

              this.resetOtherSorts($event);
              this.localdata = newArr2;

          }

          // sort by create date
          if ($event == 'startDate') {

            let newArr3 = [];

            for (let i = 0; i < newArr.length; i++) {
              newArr3.push(newArr[i]);
              let tNewArr = []
              for(let j=0; j<newArr[i].tasks.length; j++) {
                if (newArr[i].tasks[j].startDate) {
                  tNewArr.unshift(newArr[i].tasks[j])
                } else {
                  tNewArr.push(newArr[i].tasks[j])
                }
              }
              newArr3[i]["tasks"] = tNewArr;
            }

            if (this.startDateSort == "asc") {

                newArr3.forEach(todo => {
                  todo["tasks"] = todo.tasks.sort((a, b) => {
                    if (a.startDate && b.startDate) {
                      return new Date(a.startDate) - new Date(b.startDate)
                    }
                  })
                })
                
                this.startDateSort = 'desc'

            } else {

              newArr3.forEach(todo => {
                  todo["tasks"] = todo.tasks.sort((a, b) => {
                    if (a.startDate && b.startDate) {
                      return new Date(b.startDate) - new Date(a.startDate)
                    }
                  })
                })

                this.startDateSort = 'asc'
            }

            this.resetOtherSorts($event);
            this.localdata = newArr3;
          }


          // sort by due date
          if ($event == 'dueDate') {
            let newArr4 = [];

            for (let i = 0; i < newArr.length; i++) {
              newArr4.push(newArr[i]);
              let tNewArr = []
              for(let j=0; j<newArr[i].tasks.length; j++) {
                if (newArr[i].tasks[j].dueDate) {
                  tNewArr.unshift(newArr[i].tasks[j])
                } else {
                  tNewArr.push(newArr[i].tasks[j])
                }
              }
              newArr4[i]["tasks"] = tNewArr;
            }

            if (this.dueDateSort == "asc") {

                newArr4.forEach(todo => {
                  todo["tasks"] = todo.tasks.sort((a, b) => {
                    if (a.dueDate && b.dueDate) {
                      return new Date(a.dueDate) - new Date(b.dueDate)
                    }
                  })
                })

                this.dueDateSort = 'desc'

            } else {

              newArr4.forEach(todo => {
                  todo["tasks"] = todo.tasks.sort((a, b) => {
                    if (a.dueDate && b.dueDate) {
                      return new Date(b.dueDate) - new Date(a.dueDate)
                    }
                  })
                })

                this.dueDateSort = 'asc'
            }

            this.resetOtherSorts($event);
            this.localdata = newArr4;
          }


          // sort by priority
          if ($event == "priority") {
            let newArr5 = [];

              for (let i = 0; i < newArr.length; i++) {
                newArr5.push(newArr[i]);
                let tNewArr = []
                for(let j=0; j<newArr[i].tasks.length; j++) {
                  if (newArr[i].tasks[j].priorityId) {
                    tNewArr.unshift(newArr[i].tasks[j])
                  } else {
                    tNewArr.push(newArr[i].tasks[j])
                  }
                }
                newArr5[i]["tasks"] = tNewArr;
              }

              if (this.prioritySort == "asc") {

                  newArr5.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.priorityId && b.priorityId) {
                        return a.priorityId - b.priorityId
                      }
                    })
                  })

                  this.prioritySort = 'desc'

              } else {

                newArr5.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.priorityId && b.priorityId) {
                        return b.priorityId - a.priorityId
                      }
                    })
                  })

                  this.prioritySort = 'asc'
              }

              this.resetOtherSorts($event);
              this.localdata = newArr5;
          }

          // sort by department
          if ($event == "department") {
            let newArr6 = [];

            for (let i = 0; i < newArr.length; i++) {
              newArr6.push(newArr[i]);
              let tNewArr = []
              for(let j=0; j<newArr[i].tasks.length; j++) {
                if (newArr[i].tasks[j].departmentId) {
                  tNewArr.unshift(newArr[i].tasks[j])
                } else {
                  tNewArr.push(newArr[i].tasks[j])
                }
              }
              newArr6[i]["tasks"] = tNewArr;
            }

            if (this.departmentSort == "asc") {
                newArr6.forEach(todo => {
                  todo["tasks"] = todo.tasks.sort((a, b) => {
                    if (a.departmentId && b.departmentId) {
                      return a.department.title.localeCompare(b.department.title)
                    }
                  })
                })

                this.departmentSort = 'desc'

            } else {
              newArr6.forEach(todo => {
                  todo["tasks"] = todo.tasks.sort((a, b) => {
                    if (a.departmentId && b.departmentId) {
                      return b.department.title.localeCompare(a.department.title)
                    }
                  })
                })

                this.departmentSort = 'asc'
            }

            this.resetOtherSorts($event);
            this.localdata = newArr6;
          }

          // sort by difficulty
          if ($event == "difficultyId") {
            let newArr6 = [];

              for (let i = 0; i < newArr.length; i++) {
                newArr6.push(newArr[i]);
                let tNewArr = []
                for(let j=0; j<newArr[i].tasks.length; j++) {
                  if (newArr[i].tasks[j].difficultyId) {
                    tNewArr.unshift(newArr[i].tasks[j])
                  } else {
                    tNewArr.push(newArr[i].tasks[j])
                  }
                }
                newArr6[i]["tasks"] = tNewArr;
              }

              if (this.difficultySort == "asc") {

                  newArr6.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.difficultyId && b.difficultyId) {
                        return a.difficultyId - b.difficultyId
                      }
                    })
                  })

                  this.difficultySort = 'desc'

              } else {

                newArr6.forEach(todo => {
                    todo["tasks"] = todo.tasks.sort((a, b) => {
                      if (a.difficultyId && b.difficultyId) {
                        return b.difficultyId - a.difficultyId
                      }
                    })
                  })

                  this.difficultySort = 'asc'
              }

              this.resetOtherSorts($event);
              this.localdata = newArr6;
          }


          this.key += 1
          this.checkActive($event)
      })
       
    },

    toggleSidebar($event) {
      // in case of create task 
      if (!$event) {
        // this.$nuxt.$emit("open-sidebar", $event)
        this.$nuxt.$emit("open-sidebar", {...$event, userId: this.loggedUser.Id});
      }
      this.flag = !this.flag;
    },

    copyTaskLink(task) {
        let url = window.location.host + `/tasks/${task.id}`;
        if (navigator.clipboard) { 
          navigator.clipboard.writeText(url);
        } else { 
          unsecuredCopyToClipboard(url);
        }
    },

    searchTasks(text) {
      this.$store.dispatch("todo/fetchTodos", { filter: this.filterViews,sName:this.groupby}).then((res) => {
        let formattedText = text.toLowerCase().trim();
        let Ts = JSON.parse(JSON.stringify(this.todos))
        let newArr = Ts.map((todo) => {
          let filtered = todo.tasks.filter((t) => {
            if(t.title.includes(formattedText) || t.title.toLowerCase().includes(formattedText)) {
                return t
              } 
            })

          todo.tasks = filtered
          return todo;
        })

        if(newArr.length >= 0) {
          this.localdata = newArr
          this.$store.commit('todo/setTaskCount',newArr)
          this.key++;
        } else {
          this.localdata = this.todos;
          this.key++;
        }
      })
  
    }
  },

}

</script>
<style lang="scss" scoped>
.mytask-page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.mytask-table-wrapper {
  overflow: auto;
}
.grid-wrapper {
  overflow: auto;
  .grid-content {
    /*height: calc(100% - 18px);*/
  }
}
.highlight {
  outline: 2px skyblue dashed;
  background-color: #e6e6e6;
}

</style>
