<template>
  <client-only>
    <div id="page" class="task-page-wrapper">
      <page-title title="Tasks" :count="taskcount"></page-title>
      <!-- <page-title title="Tasks" :count="tasksCount"></page-title> -->
      <company-tasks-actions
        :gridType="gridType"
        v-on:filterView="filterView"
        @taskSortValue="sortBy($event)"
        @taskGroupValue="taskGroup($event)"
        v-on:new-task="toggleSidebar($event)"
        @change-grid-type="($event) => (gridType = $event)"
        @search-tasks="searchTasks"
      ></company-tasks-actions>
      <div id="task-table-wrapper" class="task-table-wrapper position-relative " :class="{ 'bg-light': gridType != 'list' }" >

        <template v-if="taskcount > 0">
          <div v-if="gridType === 'list'" class="h-100 overflow-auto" :style="{ 'width': contentWidth }">
              
            <adv-table-three :tableFields="taskFields" :tableData="localData" :plusButton="plusButton" :contextItems="contextMenuItems" @context-open="contextOpen" @context-item-event="contextItemClick" @table-sort="sortBy" @row-click="openSidebar" @title-click="openSidebar" @update-field="updateTask" @section-dragend="sectionDragEnd" @row-dragend="taskDragEnd" :newRow="newRow" @create-row="createNewTask" :drag="dragTable" :key="templateKey" :editSection="group" :lazyComponent="lazyComponent" :filter="filterViews"></adv-table-three>
          
          </div>
        
          <div v-if="gridType == 'grid'" id="tgs-scroll" class="h-100 overflow-auto position-relative" :style="{ 'width': contentWidth }">
            
            <task-grid-section
              :sections="localData"
              :activeTask="activeTask"
              :templateKey="key"
              v-on:update-key="updateKey"
              v-on:create-task="toggleSidebar($event)"
              v-on:set-favorite="taskSetFavorite"
              v-on:mark-complete="taskMarkComplete"
              v-on:delete-task="gridDeleteTask"
              @section-dragend="sectionDragEnd"
              @task-dragend="taskDragEnd"
              sectionType="department"
              :group="group"
            >
            </task-grid-section>

          </div>
        </template>

        <no-data v-else></no-data>

        <!-- user-picker for board view -->
        <user-picker :show="userPickerOpen" :coordinates="popupCoords" @selected="updateAssignee('Assignee', 'userId', $event.id, $event.label)" @close="userPickerOpen = false"
        ></user-picker>

        <!-- date-picker for board view -->
        <!-- <inline-datepicker :show="datePickerOpen" :datetime="activeTask[datepickerArgs.field]" :coordinates="popupCoords" @date-updated="updateDate" @close="datePickerOpen = false" ></inline-datepicker> -->

        <loading :loading="loading"></loading>

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

        <!-- popup notification -->
        <bib-popup-notification-wrapper>
          <template #wrapper>
            <bib-popup-notification
              v-for="(msg, index) in popupMessages"
              :key="index"
              :message="msg.text"
              :variant="msg.variant"
            >
            </bib-popup-notification>
          </template>
        </bib-popup-notification-wrapper>
        <alert-dialog
          v-show="alertDialog"
          :message="alertMsg"
          @close="alertDialog = false"
        ></alert-dialog>
      </div>
    </div>
  </client-only>
</template>

<script>
import { mapGetters } from "vuex";
import { COMPANY_TASK_FIELDS, TASK_CONTEXT_MENU, FIELDS_LOG } from "../../config/constants";
import { unsecuredCopyToClipboard } from "~/utils/copy-util.js";
import _ from "lodash";

export default {
  name: "Tasks",
  data() {
    return {
      title: "Tasks",
      gridType: "list",
      taskFields: COMPANY_TASK_FIELDS,
      taskContextMenu: false,
      activeTask: {},
      taskToDelete: {},
      contextMenuItems: TASK_CONTEXT_MENU,
      loading: false,
      flag: false,
      viewName: "all",
      dueDateSort: 'asc',
      startDateSort: 'asc',
      departmentSort: 'asc',
      prioritySort: 'asc',
      statusSort: 'asc',
      titleSort: 'asc',
      userSort: 'asc',
      projectSort: 'asc',
      difficultySort: 'asc',
      key: 99,
      templateKey: 0,
      sortName: "",
      popupMessages: [],
      popupCoords: {},
      userPickerOpen: false,
      // datePickerOpen: false,
      datepickerArgs: { label: "", field: "" },
      statusPickerOpen: false,
      priorityPickerOpen: false,
      deptPickerOpen: false,
      alertDialog: false,
      alertMsg: "",
      localData: [],
      lazyComponent: false,
      plusButton: {
        show: true,
        label: "New Task",
        icon: "add",
      },
      group:"department",
      newRow: {
        show: false,
        id: "",
        sectionId: "",
        title: "",
        userId: "",
        statusId: null,
        priorityId: null,
        startDate: "",
        dueDate: "",
        departmentId: null,
        description: "",
        budget: "",
        text: "",
      },
      contentWidth: "100%",
      dragTable: true,
      showPlaceholder: false,
      taskDeleteConfirm: false,
      highlight: null,
      deleteBtnHover: false,
      initialData: [],

    };
  },
  computed: {
    ...mapGetters({
      tasks: "company/getCompanyTasks",
      teamMembers: "user/getTeamMembers",
      filterViews :'task/getFilterView',
      sidebar: "task/getSidebarVisible",
      grid:"task/getGridType",
      taskcount: "company/getTaskCount",
      departments: "department/getAllDepartments",
      groupby: "task/getGroupBy",
      currentTask: 'task/getSelectedTask',
      user2: "user/getUser2",
    }),
    // taskcount(){
    //   return this.tasks.reduce((acc, td) => acc + td.tasks.length, 0)
    // },
  
  },

  watch: {
    taskcount(newValue){
      return this.$lodash.cloneDeep(newValue)
    },
    filterViews(newValue){
      return this.$lodash.cloneDeep(newValue)
    },
    tasks(newVal) {
      let data = this.$lodash.cloneDeep(newVal);
      // console.info("watch tasks")
      if (this.group == 'department' || this.group == 'default') {
        this.localData = data.sort((a,b) => a.deptOrder - b.deptOrder)
      } else {
        this.localData = data
      }
    },
    gridType() {
      this.$store.commit('task/gridType', {gridType: this.gridType})
      localStorage.setItem('grid', this.gridType)
      this.updateKey()
      // this.key++;
    },
    sidebar(newVal){
      const page = document.getElementById("page")
      this.$nextTick(() => {
        const panel = document.getElementById("side-panel-wrapper")
        if (this.sidebar) {
          this.contentWidth = (page.scrollWidth - panel.offsetWidth) + 'px'
        } else {
          this.contentWidth = '100%'
        }
      });
    }
  },

  async asyncData({$axios, app,store}){

    const token = app.$cookies.get(process.env.SSO_COOKIE_NAME)
    const filter=store.getters['task/getFilterView']
    const res = await $axios.get(`company/tasks/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Filter': filter
      }
    })
    store.dispatch('company/setCompanyTasks', {data:res.data.data})
    return { localData: res.data.data, initialData: res.data.data}

  },

  created() {
    if (process.client) {
      this.$nuxt.$on("update-key", (msg) => {
        this.updateKey()
      });
      // this.$nuxt.$on("close-expand", (msg) => {
      //   this.updateKey()
      // });
      this.$nuxt.$on("user-picker", (payload) => {
        // emitted from <task-grid>
        this.showUserPicker(payload);
      });
      /*this.$nuxt.$on("date-picker", (payload) => {
        // emitted from <task-grid>
        this.showDatePicker(payload);
      });*/
      this.$nuxt.$on("change-duedate", payload => {
        // emitted from <task-grid>
        this.changeDate(payload)
      })
      this.$nuxt.$on("refresh-table", () => {
        // console.log("task_created_on-refresh")
        this.updateKey();
      });
  
      this.$nuxt.$on('updateTaskCount', (payload) => {
        if (payload.action === 'increase') {
          // console.log("increase")
          this.projectcount += 1 // Increase taskcount
        } else if (payload.action === 'decrease') {
          // console.log("decrease")
          this.projectcount -= 1 // Decrease taskcount
        }
      })
    }
  },
  beforeDestroy(){ 
    this.$nuxt.$off("update-key");
    this.$nuxt.$off("refresh-table");
    this.$nuxt.$off("user-picker")
    this.$nuxt.$off("change-duedate")
    this.$nuxt.$off('updateTaskCount')
    this.localData = []
    this.initialData = []
  },
  mounted() {

    if(process.client) {
      if (this.tasks.length<=0) {
        this.updateKey();
      }
      // console.log(this.user2.Role)
      if (this.user2?.Role != "ADMIN") {
        this.$router.push('/error/403')    
      }

      for(let field of this.taskFields) {
        if(field.header_icon) {
          field.header_icon.isActive = false;
        }
      }
      // this.$store.dispatch("company/fetchInitialCompanyTasks",{filter:'all'})
      this.$store.commit('task/setGroupBy',"department")
      // this.updateKey()
        setTimeout(() => {
          if(localStorage.getItem('grid')){
            this.gridType = localStorage.getItem('grid')
          } else {
            this.gridType = this.grid
          }

          // this.gridType = this.grid || "list"
          this.lazyComponent = true
        }, 200);
        
        this.gridType = this.grid || "list"
        this.lazyComponent = true
    }
  
  },

  methods: {
    
    showUserPicker(payload) {
      this.closeAllPickers();
      this.userPickerOpen = true;
      this.popupCoords = {
        left: event.clientX + "px",
        top: event.clientY + "px",
      };
      this.activeTask = payload.task;
    },
    /*showDatePicker(payload) {
      // payload consists of event, task, label, field
      this.closeAllPickers();
      this.datePickerOpen = true;
      this.popupCoords = {
        left: event.clientX + "px",
        top: event.clientY + "px",
      };
      this.activeTask = payload.task;
      this.datepickerArgs.field = payload.field || "dueDate";
      this.datepickerArgs.label = payload.label || "Due date";
    },*/
    
    closeAllPickers() {
      this.taskContextMenu = false;
      this.userPickerOpen = false;
      // this.datePickerOpen = false;
      this.activeTask = {};
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

    updateKey(value) {
      if (value) {
        this.popupMessages.push({ text: value, variant: "primary-24" })
      }
      let compid = JSON.parse(localStorage.getItem("user")).subb;
      this.$store
        .dispatch("company/fetchCompanyTasks", {
          companyId: compid,
          filter: this.filterViews,
          sName: this.group
        })
        .then((res) => {
          // console.info("update key");
          /*if (this.group == 'department' || this.group == '') {
            this.localData = res.sort((a,b) => a.deptOrder - b.deptOrder)
          }*/
          this.key += 1;
          this.templateKey += 1;
        });
       
    },

    openSidebar(task, scroll) {
      let fwd = this.$donotCloseSidebar(event.target.classList);
      if (!fwd) {
        this.$nuxt.$emit("close-sidebar");
        return false;
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

    closeContext() {
      this.taskContextMenu = false;
      this.activeTask = {};
    },

    contextItemClick(key, item) {
      switch (key) {
        case "done-task":
          this.taskMarkComplete(item);
          break;
        case "fav-task":
          this.taskSetFavorite(item);
          break;
        case "delete-task":
          // this.deleteTask(item);
          this.taskDeleteConfirm = true
          this.taskToDelete = item
          break;
        case "copy-task":
          this.copyTaskLink(item);
          break;
        case "gotoTeam":
          this.$nuxt.$emit("add-member-to-task");
          break;
        case "gotoComment":
          this.openSidebar(item, "task_conversation");
          break;
        case "gotoSubtask":
          this.openSidebar(item, "task_subtasks");
          break;
        case "gotoFiles":
          this.openSidebar(item, "task_files");
          break;
        default:
          this.alertDialog = true;
          this.alertMsg = "No task assigned";
          break;
      }
    },

    updateTask(payload) {
      // console.log(payload)
      const {item, label, field, value, historyText} = payload
      let user, projectId;
      let data = { [field]: value }
      let oldlog
      let toBeLogged = false

      this.$store.dispatch("task/fetchHistory", item).then(h => {

        oldlog = this.$oldLog(label)

        if (field == "userId" && value != "") {
          user = this.teamMembers.find((t) => t.id == value);
        } else {
          user = null;
        }
   
        if (item.project && item.project[0] && item.project?.length > 0) {
          projectId = item.project?.[0].project?.id || item.project?.[0].project?.id;
        } else {
          projectId = null;
        }

        if (field == "statusId" && value == 0) {
          data = { [field]: null};
        }

        if (field == "priorityId" && value == 0) {
          data = { [field]: null};
        }
      
        if(field == "dueDate" && item.startDate){
          if(value=="Invalid Date"){
            data = { [field]: null }
          }else {
            data = { [field]: value }
          }
    
        }
        if(field == "startDate" && item.dueDate){
          if(value=="Invalid Date"){
            data = { [field]: null }
          }else {
            data = { [field]: value }
          }
        }

        if (FIELDS_LOG.includes(field)) {
          toBeLogged = true
        } else {
          toBeLogged = false
        }

        // console.log(toBeLogged, oldlog)
        
        this.$store
          .dispatch("task/updateTask", {
            id: item.id,
            projectId,
            data: data,
            user: user ? [user] : null,
            text: historyText,
            toBeLogged,
            oldLog: oldlog ? {id: oldlog.id, userId: oldlog.userId} : null
          })
          .then((t) => {
            // this.updateKey()
          })
          .catch((e) => console.warn(e));
        })

    },

    updateAssignee(label, field, value, historyText) {
      // console.log(...arguments)
      let user;
      if (field == "userId" && value != "") {
        user = this.teamMembers.filter((t) => t.id == value);
      } else {
        user = null;
      }
      this.userPickerOpen = false;
      // console.log(user)

      this.$store
        .dispatch("task/updateTask", {
          id: this.activeTask.id,
          data: { [field]: value },
          user,
          text: `changed ${label} to ${historyText}`,
        })
        .then((t) => {
          if(this.grid=="grid") {
            this.updateKey()
          }
           
        })
        .catch((e) => console.warn(e));
    },

    /*updateDate(value) {
      if(this.datepickerArgs.field==="dueDate") {
          if(new Date(value).toISOString().slice(0, 10)>new Date(this.activeTask.startDate).toISOString().slice(0, 10))
            {
              this.changeDate(value)
            } else {
              this.popupMessages.push({ text: "Invalid date", variant: "danger" });
            }
        } else {
          if(new Date(value).toISOString().slice(0, 10)<new Date(this.activeTask.dueDate).toISOString().slice(0, 10)){
                this.changeDate(value)
            } else {
              this.popupMessages.push({ text: "Invalid date", variant: "danger" });
            }
        }
    },*/

    showBlankTask(sectionId) {
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

    changeDate({id, field, label, value, oldlog}){
      // let newDate = dayjs(value).format("D MMM YYYY");
      let toBeLogged = false;
      if (FIELDS_LOG.includes(field)) {
          toBeLogged = true
        } else {
          toBeLogged = false
        }

      this.$store
        .dispatch("task/updateTask", {
          id,
          data: { [field]: value },
          user: null,
          text: `changed ${label} to ${this.$formatDate(value)}`,
          toBeLogged,
          oldLog: oldlog || null
        })
        .then((t) => {
            this.updateKey();
        })
        .catch((e) => console.warn(e));
    },

    taskSetFavorite(task) {
      // this.loading = true;
      if(this.$CheckFavTask(task.id)){
        this.$store
          .dispatch("task/removeFromFavorite", { id: task.id })
          .then((msg) => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
            // this.loading = false;
          })
          .catch((e) => {
            // this.loading = false;
            console.warn("fav-task->", e);
          });
      } else {
        this.$store
          .dispatch("task/addToFavorite", { id: task.id })
          .then((msg) => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
            // this.loading = false;
          })
          .catch((e) => {
            // this.loading = false;
            console.warn("fav-task->", e);
          });
      }
    },

    taskMarkComplete(task) {
      if (typeof task == "object" && Object.keys(task).length > 0) {
        // console.log(task);
      } else {
        task = this.activeTask;
      }
      this.$store
        .dispatch("task/updateTaskStatus", task)
        .then((d) => {
          this.$store.dispatch("task/setSingleTask", d).then(() => {
            this.updateKey();
          });
        })
        .catch((e) => {
          console.warn(e);
        });
    },

    gridDeleteTask(item) {
       this.taskDeleteConfirm = true
       this.taskToDelete = item
    },

    deleteTask(task) {
      if (this.taskToDelete) {
        this.$store
          .dispatch("task/deleteTask", this.taskToDelete)
          .then((t) => {
            if (t.statusCode == 200) {
              this.$nuxt.$emit("delete_update_table",this.taskToDelete,this.$route.fullPath)
              // this.updateKey(t.message);
            } else {
              this.popupMessages.push({ text: t.message, variant: "primary-24" });
              console.warn(t.message);
            }
          })
          .catch((e) => {
            console.warn(e);
          }).then(() => {
            this.taskToDelete = {}
            this.taskDeleteConfirm = false
          });
      } else {
        this.popupMessages.push({
          text: "Action cancelled",
          variant: "primary-24",
        });
      }
    },

    async filterView($event) {
      this.$store.commit('task/setFilterView', {filter:$event})
      this.updateKey()
      // this.$store.commit("company/getFilterTasks",{filter:$event, groupBy:this.group})
    },

    checkActive() {
      for (let i = 0; i < this.taskFields.length; i++) {
        if (this.taskFields[i].header_icon) {
          this.taskFields[i].header_icon.isActive = false;
        }

        if (
          this.taskFields[i].header_icon &&
          this.taskFields[i].key == this.sortName
        ) {
          this.taskFields[i].header_icon.isActive = true;
        }
      }
      this.templateKey++;
    },
    //group by
    taskGroup($event) {
      this.group = $event
      this.lazyComponent = false
      if($event != 'default') {
        this.dragTable = false;
      } else {
        this.group = 'department'
        this.dragTable = true;
        // this.$store.commit('todo/setGroupBy',this.group)
        // this.$store.commit('company/groupTasks',{sName:"department"})
        // return;
      }
      this.$store.commit('task/setGroupBy',this.group)
      this.updateKey()
      this.lazyComponent = true
      // this.$store.commit('company/groupTasks',{sName:this.group})
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
      let compid = JSON.parse(localStorage.getItem("user")).subb;
      this.$store
        .dispatch("company/fetchCompanyTasks", {
          companyId: compid,
          filter:this.filterViews,
          sName:this.group
        })
        .then(() => {
          this.sortName = $event;
            if ($event == "title") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.titleSort,
                })

                if (this.titleSort == "asc") {
                  this.titleSort = "desc";
                } else {
                  this.titleSort = "asc";
                }
            }

            if ($event == "userId") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.userSort,
                })

              if (this.userSort == "asc") {
                  this.userSort = "desc";
                } else {
                  this.userSort = "asc";
                }

            }

            if ($event == "project") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.projectSort,
                })
              
              if (this.projectSort == "asc") {
                  this.projectSort = "desc";
                } else {
                  this.projectSort = "asc";
                }
            }

            if ($event == "department") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.departmentSort,
                })

              if (this.departmentSort == "asc") {
                  this.departmentSort = "desc";
                } else {
                  this.departmentSort = "asc";
                }
            }

            if ($event == "difficultyId") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.difficultySort,
                })

              if (this.difficultySort == "asc") {
                  this.difficultySort = "desc";
                } else {
                  this.difficultySort = "asc";
                }
            }

            if ($event == "status") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.statusSort,
                })

              if (this.statusSort == "asc") {
                  this.statusSort = "desc";
                } else {
                  this.statusSort = "asc";
                }
            }

            if ($event == "priority") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.prioritySort,
                })

              if (this.prioritySort == "asc") {
                  this.prioritySort = "desc";
                } else {
                  this.prioritySort = "asc";
                }
            }

            if ($event == "startDate") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.startDateSort,
                })

              if (this.startDateSort == "asc") {
                  this.startDateSort = "desc";
                } else {
                  this.startDateSort = "asc";
                }
            }

            if ($event == "dueDate") {
              this.$store
                .dispatch("company/sortCompanyTasks", {
                  sName: $event,
                  order: this.dueDateSort,
                })

                if (this.dueDateSort == "asc") {
                  this.dueDateSort = "desc";
                } else {
                  this.dueDateSort = "asc";
                }
            }

            this.resetOtherSorts($event)
            this.checkActive();
            this.key += 1;
        })
     
    },

    toggleSidebar($event) {
      // console.log($event)
      let t = this.localData.find(ld => ld.title == "Unassigned")
      this.flag = !this.flag;
      if ($event.id) {
        this.$nuxt.$emit("open-sidebar", $event.id);
      } else {
        this.$nuxt.$emit("open-sidebar", { department: $event, data: { tasks: t.tasks} });
      }
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

      let compid = JSON.parse(localStorage.getItem("user")).subb;
      this.$store
        .dispatch("company/fetchCompanyTasks", {
          companyId: compid,
          filter:this.filterViews,
          sName:this.group
        })
        .then(() => {
            let formattedText = text.toLowerCase().trim();
            let depts = JSON.parse(JSON.stringify(this.tasks));
            let newArr = depts.map((d) => {
              let filtered = d.tasks.filter((t) => {
                if (t.title.includes(formattedText) || t.title.toLowerCase().includes(formattedText)) {
                  return t;
                }
              });

              d["tasks"] = filtered;
              return d;
            });

            if (newArr.length >= 0) {
              this.localData = newArr;
              this.$store.commit('company/setTaskCount',newArr)
              this.key++;
            } else {
              this.localData = JSON.parse(JSON.stringify(this.tasks));
              this.key++;
            }
        });
    },

    sectionDragEnd: _.debounce(async function (payload) {
      this.loading = true;

      let clone = this.$lodash.cloneDeep(payload);
      clone.forEach((el, i) => {
        el.deptOrder = i;
      });
      let filtered = clone.filter(dc => dc.title != "Unassigned")
      // console.log(clone, filtered)
      // return
      let sectionDnD = await this.$axios.$put("/department/dragdrop", { data: filtered }, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken"),
            "Content-Type": "application/json",
          },
        });
      if (sectionDnD.statusCode == 200) {
        this.updateKey()
      }

      this.loading = false;
    }, 600),

    moveTask(e) {
      // this.taskDnDsectionId = +e.to.dataset.section
      this.highlight = +e.to.dataset.section
    },

    taskDragEnd: _.debounce(async function (payload) {
      this.loading = true;
      let tasks = this.$lodash.cloneDeep(payload.tasks);
      tasks.forEach((el, i) => {
        el.dOrder = i;
      });
      let dept = this.departments.find(d => d.label == payload.title)
      // console.log(payload, tasks, dept)
      // return
      let taskDnD = await this.$axios.$put( "/department/crossDepartmentDragDrop",{
        data: tasks,
        departmentId: dept ? Number(dept.value) : null
      }, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken"),
            "Content-Type": "application/json",
          },
        }
      );
      if (taskDnD.statusCode == 200) {
        this.updateKey();
      } else {
        console.warn(taskDnD.message);
      }
      this.loading = false;
    }, 600),

    createNewTask(task,section) {
      task.group = this.group;
      task.status = null
      task.statusId = null
      task.priority = null
      task.priorityId = null
      task.departmentId = null;
      task.department = null;
      task.user = null
      task.userId = null
      task.projectId = null
      task.difficultyId =null
      task.todoId = section.tasks[0]?.todoId?section.tasks[0]?.todoId:section.id
      
      if(this.group == "priority"){
        task.priority = section.tasks[0]?.priority
        task.priorityId = section.tasks[0]?.priorityId
     
      }
      if(this.group == "status"){
        task.status = section.tasks[0]?.status
        task.statusId = section.tasks[0]?.statusId
      }
      if(this.group == "assignee"){
        task.user = [section.tasks[0]?.user]
        task.userId = section.tasks[0]?.userId
      }
      if(this.group == "department"){
        task.department = section.tasks[0]?.department?section.tasks[0]?.department:null
        task.departmentId = section.tasks[0]?.departmentId?section.tasks[0]?.departmentId:null
      }
      if(this.group == "difficulty"){
        task.difficultyId = section.tasks[0]?.difficultyId
      }
      if(this.group == "project"){
        task.projectId = section.tasks[0]?.project?.[0].project?.id || null 
      }

      // section.tasks.forEach((el, i) => {
      //   el.dOrder = i;
      // });

      section["id"] = task.departmentId
      delete task.show
      if (this.group || this.group == "department") {
        delete task.sectionId
      }

      this.$store.dispatch("task/createTask", {
          ...task,
          data: section,
          mode: "department",
          text: `created task ${task.title}`,
        })
        .then((t) => {
          // console.log("t",t)
          this.resetNewRow();
          this.$nuxt.$emit("newTask",t.data,this.$route.fullPath)
          // this.updateKey();
        })
        .catch((e) => {
          console.warn(e);
        });
    },

    resetNewRow() {
      this.newRow = {
        show: false,
        id: "",
        sectionId: null,
        title: "",
        user:null,
        userId: null,
        statusId: null,
        priorityId: null,
        projectId: null,
        startDate: "",
        dueDate: "",
        departmentId: null,
        description: "",
        budget: "",
        text: "",
      };
      this.userPickerOpen = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.task-page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.task-table-wrapper {
  height: calc(100% - 100px);
}

.section-options {
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s;
}
.highlight {
  outline: 2px skyblue dashed;
  background-color: #e6e6e6;
}
</style>
