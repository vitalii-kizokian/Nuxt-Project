<template>
  <article id="side-panel-wrapper" :class="expandVisible?'side-panel':'side-panel expandVisible'" v-click-outside="closeSidebar">
    <div class="side-panel__header" id="tsb-header">
      <div class="d-flex justify-between pt-105 px-105 pb-05" id="ts-side-panel">
        <div class="" id="tsb-mark-button-wrapper" >
          <!-- <div class="bg-light shape-rounded px-1 height-2 d-inline-flex gap-05 align-center justify-center cursor-pointer" @click="markComplete">
            <bib-icon icon="check-circle-solid" :variant="isComplete.variant" :scale="1"></bib-icon> <span class="font-md text-secondary">{{isComplete.text}}</span>
          </div> -->
          <span v-show="form.id">
           <bib-button :label="isComplete.text" :variant="isComplete.variant" icon="check-circle-solid" @click="markComplete"></bib-button >
          </span>
        </div>
        <div class="d-flex gap-05 align-center" id="tsb-icons-wrapper">
          <div v-show ="expandVisible" class="d-flex cursor-pointer bg-light bg-hover-gray2 shape-circle width-2 height-2" id='tsb-icon-external' @click="setExpand">
            <bib-icon icon="expand-fullscreen" variant="gray6" class="m-auto"></bib-icon>
          </div>
          <div class="p-025 cursor-pointer bg-light bg-hover-gray2 shape-circle width-2 height-2 d-flex align-center justify-center" id="tsb-icon-6" @click="setFavorite" v-show="form.id">
            <bib-spinner v-if="favProcess" :scale="2" ></bib-spinner>
            <bib-icon v-else icon="bookmark-solid" :variant="isFavorite.variant" ></bib-icon>
          </div>
          <div id="tsb-list-wrap" class="cursor-pointer bg-light bg-hover-gray2 shape-circle width-2 height-2 d-flex align-center justify-center" v-show="form.id">
            <bib-button pop="elipsis">
              <template v-slot:menu>
                <div class="list" id="tsb-list">
                  <span class="list__item" id="tsb-list-item-1" @click="markComplete">
                    <bib-icon icon="check-circle-solid" :variant="isComplete.iconVariant" class="mr-05"></bib-icon> {{isComplete.text}}
                  </span>
                  <hr>
                  <span class="list__item" id="tsb-list-item-2" @click="setFavorite">
                    <bib-spinner v-if="favProcess" :scale="2" ></bib-spinner>
                    <bib-icon v-else icon="bookmark-solid" :variant="isFavorite.variant" class="mr-05"></bib-icon>
                    {{isFavorite.text}}
                  </span>
                  <span class="list__item" id="tsb-list-item-5"  @click="scrollToSubtasks">
                    <bib-icon icon="check-square-solid" variant="gray4" class="mr-05"></bib-icon> Subtasks
                  </span>
                  <span class="list__item" id="tsb-list-item-3"   @click="scrollToFiles">
                    <bib-icon icon="file" variant="gray4" class="mr-05"></bib-icon> Files
                  </span>
                  <span class="list__item" id="tsb-list-item-7" @click="scrollToConversation">
                    <bib-icon icon="comment-forum-solid" variant="gray4" class="mr-05"></bib-icon> Conversation
                  </span>
                  <span class="list__item" id="tsb-project-id-list-item3" @click="copyTaskLink">
                    <bib-icon icon="duplicate" variant="gray4" class="mr-05"></bib-icon> Copy Link
                  </span>
                  <hr>
                  <span class="list__item list__item__danger" 
                      @mouseenter="deleteBtnHover = true"
                      @mouseleave="deleteBtnHover = false" 
                      id="tsb-list-item-8" @click="deleteTaskConfirm(currentTask)">
                    <bib-icon icon="trash" :variant='deleteBtnHover ? `white` : `danger`' class="mr-075"></bib-icon> Delete 
                  </span>
                </div>
              </template>
            </bib-button>
          </div>
          <div v-if="expandVisible" id='tsb-icon-close' class="shape-circle bg-hover-light width-2 height-2 d-flex cursor-pointer" title="Close" @click="$nuxt.$emit('close-sidebar')">
            <bib-icon icon="close" class="m-auto"></bib-icon>
          </div>
          <div v-else id='tsb-icon-close' class="shape-circle bg-hover-light width-2 height-2 d-flex cursor-pointer" title="Close" @click="closeExpand">
            <bib-icon icon="close" class="m-auto"></bib-icon>
          </div>
        </div>
      </div>
      <div class=" border-bottom-gray3 position-relative px-105 py-05 " id="tsb-title">
        <!-- :class="{'error': error == 'invalid'}" -->
        <!-- <input type="text" class="editable-input" :class="{'error': error == 'invalid'}" ref="taskTitleInput" v-model.trim="form.title" placeholder="Enter Task Name ..." v-on:keyup="debounceUpdate({name:'Title', field:'title', value:form.title})" > -->
        <!-- <textarea v-model.trim="form.title" ref="taskTitleInput" class="editable-input multiline position-absolute" @blur="" v-on:keyup="debounceUpdate({name:'Title', field:'title', value:form.title})" v-on:keydown.enter.prevent placeholder="Enter Task Name ..." style="height: calc(100% - 1rem);" ></textarea> -->
        <textarea v-model.trim="form.title" ref="taskTitleInput" class="editable-input multiline position-absolute"  v-on:keyup="debounceUpdate({name:'Title', field:'title', value:form.title})"  @keyup.enter="debounceUpdate({name:'Title', field:'title', value:form.title})" v-on:keydown.enter.prevent placeholder="Enter Task Name ..." style="height: calc(100% - 1rem);" ></textarea>
        <div class="pseudo-title" aria-hidden="true" >{{form.title}}</div>
      </div>
      
    </div>

    <div class="overflow-y-auto d-grid" id="tsb-of-scroll-y" style="grid-template-columns: none; align-items: start">
      <div class="border-bottom-gray3 px-105 py-05" v-show="form.id">
        <div class="align-center gap-05" >
          <span class="font-sm text-gray6" style="white-space: nowrap;">Assigned to</span> 
          <div class="mr-1" style="flex-basis: 2rem;">
            <user-select-two :userId="currentTask.userId" mode="avatar" minWidth="15rem" maxWidth="18rem" @change="updateAssignee" ></user-select-two> <!-- <bib-avatar></bib-avatar> -->
          </div>
          <!-- <div class="d-inline-flex align-center">
          </div> -->
        
          <div class="align-center height-2 cursor-pointer" > 
            <user-select-two userId="" mode="icon" title="Add to team" min-width="15rem" max-width="18rem" @change="addTeamMember"></user-select-two>
            <team-list-two :reloadTeam="reloadTeam" :team="team" @delete-member="deleteMember"></team-list-two>
            <!-- <bib-icon icon="user-group-solid"></bib-icon> -->
          </div>
        </div>
      </div>

      <sidebar-fields-two :task="currentTask" @update-project-field="updateProject" @update-field="updateTask" @newtask-fields="updateTaskform" :activeProp="form.id"></sidebar-fields-two>
      <sidebar-tag :tags="tags" @add-tag="addTag" @change="addTag" @delete-tag="removeTag" :activeProp="form.id"></sidebar-tag>
      <sidebar-subtask id="task_subtasks" @view-subtask="viewSubtask($event)" @close-sidebar-detail="showSubtaskDetail = false" :activeProp="form.id"></sidebar-subtask>
      <sidebar-files id="task_files" :reloadFiles="reloadFiles" :activeProp="form.id"></sidebar-files>
      <sidebar-conversation id="task_conversation" :reloadComments="reloadComments" :reloadHistory="reloadHistory" :activeProp="form.id"></sidebar-conversation>
    </div>

    <div class="task-message-input d-flex gap-1 border-top-gray3 py-1 px-2" v-show="form.id">
      <bib-avatar :src="userPhoto" size="2rem" class="flex-shrink-0" ></bib-avatar>
      <message-input class="flex-grow-1" :value="value" key="taskMsgInput" :editingMessage="editMessage" @input="onFileInput" @submit="onsubmit"></message-input>
    </div>

    <!-- <bib-modal-wrapper v-if="taskTeamModal" title="Team" size="lg" @close="taskTeamModal = false">
      <template slot="content">
        <div style="min-height: 12rem;">
          <task-team :task="currentTask"></task-team>
        </div>
      </template>
    </bib-modal-wrapper> -->

    <bib-modal-wrapper v-if="taskConfirmModal" title="Delete subtask(s)" @close="taskConfirmModal = false">
      <template slot="content">
        <p>All the subtasks in the task will be deleted permanently and wont be recoverable</p>
      </template>
      <template slot="footer">
          <div class="justify-between">
            <bib-button label="Retain Subtasks" variant="secondary--outline" pill @click="deleteTask(true)"></bib-button>
            <bib-button label="Delete" variant="danger" pill @click="deleteTask(false)"></bib-button>
          </div>
      </template>
    </bib-modal-wrapper>

    <bib-popup-notification-wrapper>
      <template #wrapper>
        <bib-popup-notification v-for="(msg, index) in popupMessages" :key="index" :message="msg.text" :variant="msg.variant" :autohide="4000">
        </bib-popup-notification>
      </template>
    </bib-popup-notification-wrapper>
    
    <subtask-detail v-if="showSubtaskDetail" @close-sidebar-detail="showSubtaskDetail = false" @subtask-desc="subtaskDesc = $event"></subtask-detail>
  </article>
</template>

<script>
import { DEPARTMENT, STATUS, PRIORITY } from '~/config/constants.js'
import { mapGetters } from "vuex"
import _ from 'lodash'
import { unsecuredCopyToClipboard } from '~/utils/copy-util.js'
import { stripHTMLandTrim } from '~/utils/helpers.js'

export default {
  name: "TaskSidebar",
  props: {
    sectionIdActive: Number,
    // scrollId: {type: String, default: "sidebar-inner-wrap"},
    departmentId: {type: Number},
    expandVisible:{type:Boolean,default:true},
    // visible: Boolean,
    unassignedTasks: { default: () => { return null }},
  },
  data: function() {
    return {
      loading: false,
      favProcess: false,
      form: {},
      statusValues: STATUS,
      priorityValues: PRIORITY,
      department: DEPARTMENT,
      value: {
        files: []
      },
      editMessage: {},
      reloadComments: 1,
      reloadHistory: 1,
      reloadFiles: 1,
      reloadTeam: 1,
      // reloadTags: 1,
      // taskTeamModal: false,
      tags: [],
      showSubtaskDetail: false,
      popupMessages: [],
      deleteBtnHover: false,
      // titleHt: "2rem",
      subtaskDesc: null,
      taskConfirmModal: false,
      projectId: null,
    };
  },

  computed: {
    ...mapGetters({
      user: "user/getUser2",
      teamMembers: "user/getTeamMembers",
      alltasks: "company/getCompanyTasks",
      tasks: "task/tasksForListView",
      team: 'task/getTaskMembers',
      sidebarOpen: 'task/getSidebarVisible',
      departments: "department/getAllDepartments",
      project: "project/getSingleProject",
      projects: "project/getAllProjects",
      sections: "section/getProjectSections",
      currentTask: "task/getSelectedTask",
      favTasks: "task/getFavTasks",
      sideBarUser:"user/getSideBarUser",
      alltags: "company/getCompanyTags",
      mytaskGrid:"todo/getGridType",
      tasksGrid:"task/getGridType",
      singleProjectGrid:"project/getGridType",

    }),

    isFavorite() {
      let fav = this.favTasks.some(t => t.task.id == this.currentTask.id)
      if (fav) {
        return { variant: "primary-24", text: "Remove favorite", status: true }
      } else {
        return { variant: "gray4", text: "Add to favorites", status: false }
      }
    },
    isComplete() {
      if (this.currentTask.statusId == 5) {
        return { variant: "primary-24", iconVariant: "primary-24", text: "Completed" }
      } else {
        return { variant: "primary--outline", iconVariant: "gray4", text: "Mark Completed" }
      }
    },
    userPhoto(){
      if (this.user?.Photo) {
        return this.user.Photo
      }
    },
    error() {
      if (this.form.title) {
        return "valid"
      } else {
        return "invalid"
      }
    },
  },

  watch: {
    currentTask(newVal) {
      this.showSubtaskDetail = false
      if (Object.keys(this.currentTask).length) {
        this.form = this.$lodash.cloneDeep(this.currentTask);
        if (this.currentTask.project?.length) {
          this.form.projectId = this.currentTask.project[0]?.projectId || this.currentTask.project[0].project?.id
        } else {
          this.form.projectId = this.project?.id
        }

        this.reloadFiles += 1
        this.reloadTeam += 1
        // this.realodTags += 1
        this.getTags()
        
      } else {
        this.form = {
          id: null,
          title: "",
          startDate: null,
          dueDate: null,
          userId: null,
          sectionId: "",
          departmentId: this.departmentId || null,
          projectId: null,
          statusId: null,
          priorityId: null,
          description: "",
          budget: 0,
        }
        this.$nextTick(() => {
          this.$refs.taskTitleInput?.focus()
          this.tags = []
          this.reload
        });

        if (this.sectionIdActive) {
          this.form.sectionId = this.sectionIdActive
        }
      }
      this.$refs.taskTitleInput.style.height = 'calc(100% - 1rem)'
    },
    /*scrollId(newValue, oldValue){
      this.$nextTick(() => {
        this.$refs.topScroll.click()
      });
    },*/
    $route(to, from){
      // console.log("from->",from.path, "to->", to.path, to.params)
      if (to.path.includes("/projects/") && to.params.id) {
        this.projectId = this.$decodeFromHex(this.$route.params.id)
      } else {
        this.projectId = null
      }
    },
    showSubtaskDetail(newValue){
      if(!newValue){
        this.$store.dispatch("subtask/fetchSubtasks", this.currentTask )
        // console.log("false", newValue, this.subtaskDesc)
        if (this.subtaskDesc) {
          let hText = this.subtaskDesc?.value.replace( /(<([^>]+)>)/ig, '');
          hText = this.$lodash.truncate(hText, {'length': 30})
          // console.log(hText)

          this.$store.dispatch("subtask/updateSubtask", {
            id: this.subtaskDesc.id,
            data: { "description": this.subtaskDesc.value },
            text: `updated ${this.subtaskDesc.name} - ${hText}`
          })
        }
      } else {
        this.subtaskDesc = null
      }
    },

    sidebarOpen(newValue){
      if (newValue) {
        this.getTags()
        // this.$store.dispatch("company/fetchCompanyTags")
        if (this.$route.path.includes("/projects/") && this.$route.params.id) {
          this.projectId = this.$decodeFromHex(this.$route.params.id)
        } else {
          this.projectId = null
        }
      }
    },

  },

  created(){
    this.$nuxt.$on("edit-message", (msg) => {
      this.editMessage = msg
    })
  },

  mounted() {
    this.showSubtaskDetail = false
    this.$store.dispatch("project/fetchProjects")
    if (Object.keys(this.currentTask).length) {
        this.form = this.$lodash.cloneDeep(this.currentTask);
        if (this.currentTask.project?.length) {
          this.form.projectId = this.currentTask.project[0]?.projectId || this.currentTask.project[0].project?.id
        } else {
          this.form.projectId = this.project?.id
        }
        this.reloadFiles += 1
      } else {
        this.form = {
          id: null,
          title: "",
          startDate: null,
          dueDate: null,
          userId: null,
          sectionId: "",
          departmentId: this.departmentId || null,
          projectId: null,
          statusId: null,
          priorityId: null,
          description: "",
          budget: 0,
        }
        this.$nextTick(() => {
          this.$refs.taskTitleInput?.focus()
        });
        if (this.sectionIdActive) {
          this.form.sectionId = this.sectionIdActive
        }
      }

  },

  methods: {
  scrollToSubtasks() {
    this.$nextTick(() => {
      const element = document.getElementById('task_subtasks');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' ,block: "center" });
      }
    });
  },
  scrollToFiles() {
    this.$nextTick(() => {
      const element = document.getElementById('task_files');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth',block: "center" });
      }
    });
  },
  scrollToConversation() {
    this.$nextTick(() => {
      const element = document.getElementById('task_conversation');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' ,block: "end"});
      }
    });
  },

    /*showAddTeamModal() {
      // this.taskTeamModal = true
      console.info("clicked to open team modal")
    },*/
    closeExpand(){
      this.$router.push(this.$route.path)
      
      this.$store.commit("task/setExpandVisible",true)
      // this.$nuxt.$emit("close-expand")
    },
    closeSidebar(event) {
      let main = document.getElementById("main-content").className
      if(main.indexOf('open-sidebar') > 0){
        const classlist = ["cursor-pointer", "menu-item", "task-grid", "table__irow"]
        classlist.forEach(c => {
          if (event.target.classList.contains(c)) {
            return false
          } 
        })

        this.showSubtaskDetail = false
        this.$nuxt.$emit("close-sidebar");
      }
    },

    async createTask(taskform) {
      if (this.error == "valid") {
        // this.loading = true

        let user;
        if (!taskform.userId || taskform.userId != "") {
          user = this.teamMembers.filter(u => u.id == taskform.userId)
        } else {
          user = null
        }

        if ((taskform.projectId || this.$route.params.id) && (!taskform.sectionId || taskform.sectionId == "")) {
          taskform.sectionId = "_section" + (this.projectId || taskform.projectId)
        } else {
          taskform.sectionId = ""
        }

        if (!taskform.projectId || taskform.projectId == "") {
          taskform.projectId = null
          taskform.sectionId = null
        }
        // on tasks page
        if (this.$route.path.includes("/tasks")) {
          taskform["mode"] = "department";
          taskform["sectionId"] = null;
          let taskPageUnassignedTask = null;

          if (this.unassignedTasks === null) {
            let data=[...this.alltasks]
            if(data){
              let t = await data.find(ld => ld.title === "Unassigned");
              taskPageUnassignedTask = await t ? { tasks: t.tasks } : null;
              taskform["data"] =  { id: null, ...taskPageUnassignedTask }? { id: null, ...taskPageUnassignedTask }:null
            }
            else {
              taskform["data"]=null
            }
            
           
          }
          else {
            taskform["data"] =  { id: null, ...this.unassignedTasks }? { id: null, ...this.unassignedTasks }:null
          }

          taskform["userId"] = null;
          taskform["user"] = null;
        }
        // on project task page
        if (this.$route.name.includes("projects-id")) {
          taskform["mode"] = "project"
          taskform["userId"] = null
          taskform["user"] = null
        }
        if (this.$route.fullPath.includes("usertasks")) {
          taskform["mode"] = null
        }

        // console.log(taskform)

        this.$store.dispatch("task/createTask", {
          "sectionId": this.$route.fullPath.includes("usertasks")?taskform.sectionId:(this.$route.params.id ? "_section" + this.projectId : taskform.sectionId),
          "projectId": this.$route.fullPath.includes("usertasks")?taskform.projectId:Number(this.projectId || taskform.projectId),
          "title": taskform.title,
          "description": taskform.description,
          "startDate": taskform.startDate,
          "dueDate": taskform.dueDate,
          "priorityId": taskform.priorityId,
          "departmentId": taskform.departmentId,
          "budget": taskform.budget,
          "statusId": taskform.statusId,
          user,
          "text": `task "${this.form.title}" created`,
          "mode": taskform.mode,
          "data": this.$route.path === '/tasks'? taskform.data: null
        }).then((task) => {
      
          if(this.$route.path.includes("/mytasks") && this.mytaskGrid=="grid") {
            this.$nuxt.$emit("update-key")
            this.reloadHistory += 1
            this.reloadComments+=1
            return; 
          }
          if(this.$route.path.includes("/tasks") && this.tasksGrid=="grid") {
            this.$nuxt.$emit("update-key")
            this.reloadHistory += 1
            this.reloadComments+=1
            return;
          }
          if(this.$route.name.includes("projects-id") && this.singleProjectGrid=="grid"){
            this.$nuxt.$emit("update-key")
            this.reloadHistory += 1
            this.reloadComments+=1
            return;
          }

          this.$nuxt.$emit("newTask",task.data,this.$route.path)
          // this.$nuxt.$emit("gridNewTask",task.data,this.$route.path)
          this.getTableCount()
          this.$store.dispatch("task/setSingleTask", task.data)
          this.$store.dispatch('task/fetchTeamMember', { ...task.data }).then(() => {
            this.reloadTeam += 1;
          })

        }).catch(e => {
          console.warn(e)
          this.loading = false
        })
      }
    },
    async getTableCount() { 
      if(this.$route.path.includes("/mytasks")){
            const res =  await this.$axios.$get('/todo/all', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, 'Filter':  'all' }
              });
       
              for (let i=0;i < res.data.length ; i++ ) {
               let hasTaskWithLength = false;
              if (res.data[i]&&res.data[i].tasks && res.data[i].tasks.length > 0) {
                hasTaskWithLength = true;
                break; // Once we find a task with length > 0, we can stop looping
              }
              if (hasTaskWithLength) {
                  
                } else {
                  this.$nuxt.$emit("refresh-table");
                }
              }
          }
          if(this.$route.path.includes("/tasks")){
            const res = await this.$axios.$get(`company/tasks/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, 'Filter': 'all' }
              });
              if (res.data[0].tasks.length==1) {
                this.$nuxt.$emit("refresh-table");
              }

           
          }
          if(this.$route.name.includes("projects___en")){
             const res = await this.$axios.$get(`/project/company/all`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                  'Filter': 'all'
                }
              });
              if(res.data.length==1)
              {
                this.$nuxt.$emit("refresh-table");
              }
            

          }
          if(this.$route.name.includes("projects-id")){
            const res = await this.$axios.$get('/section/project/' + this.projectId, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, 'Filter': 'all' }
            });
            for (let i=0;i < res.data.length ; i++ ) {
               let hasTaskWithLength = false;
              if (res.data[i]&&res.data[i].tasks && res.data[i].tasks.length > 0) {
                hasTaskWithLength = true;
                break; // Once we find a task with length > 0, we can stop looping
              }
              if (hasTaskWithLength) {
                  
                } else {
                  this.$nuxt.$emit("refresh-table");
                }
              }

            // if (res.data?.[0]?.tasks?.length==1) {
            //   this.$nuxt.$emit("refresh-table");
            // }
          }
          if(this.$route.path.includes("/usertasks")){
            const res = await this.$axios.get("user/user-tasks", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                Filter: 'all',
                userid: this.$route.params.id,
              },
            });
            if(res.data.data.length==1)
              {
                this.$nuxt.$emit("refresh-table");
              }
          }
    },
    updateTask(taskData) {
      let data = { [taskData.field]: taskData.value }
      let projectId = null

      this.$store.dispatch("task/updateTask", {
        id: this.form.id,
        data,
        projectId: projectId ? projectId : null,
        text: taskData.historyText || taskData.value,
        toBeLogged: taskData.toBeLogged,
        oldLog: taskData.oldlog || null
      })
        .then((u) => {
          if(this.$route.path.includes("/mytasks") && this.mytaskGrid=="grid") {
            this.$nuxt.$emit("update-key")
            this.reloadHistory += 1
            this.reloadComments+=1
            return; 
          }
          if(this.$route.path.includes("/tasks") && this.tasksGrid=="grid") {
            this.$nuxt.$emit("update-key")
            this.reloadHistory += 1
            this.reloadComments+=1
            return;
          }
          if(this.$route.name.includes("projects-id") && this.singleProjectGrid=="grid"){
            this.$nuxt.$emit("update-key")
            this.$nuxt.$emit("update_table",u)
            this.reloadHistory += 1
            this.reloadComments+=1
            return;
          }
          this.$nuxt.$emit("update_table",u)
          this.reloadHistory += 1
          this.reloadComments+=1
          //  this.$store.dispatch("task/setSingleTask", u)
          
        })
        .catch(e => {
          console.log(e)
        })

    },

    updateAssignee(userData){
      // console.log(userData)
      let user = this.teamMembers.filter(u => u.id == userData.id)

      this.$store.dispatch("task/updateTask", {
        id: this.form.id,
        data: { userId: userData.id},
        user,
        // projectId: projectId ? projectId : null,
        text: `changed Assignee to ${userData.label}`,
      })
        .then((u) => {
          this.$nuxt.$emit("update-key")
          this.$store.dispatch("task/setSingleTask", u)
          this.reloadHistory += 1
          this.reloadComments += 1
          this.$store.dispatch('task/fetchTeamMember', { ...u }).then(() => {
            this.reloadTeam += 1;
          })
        })
        .catch(e => {
          console.log(e)
        })
    },

    addTeamMember(userData){
      // console.log(userData, this.form.id)

      this.$store.dispatch('task/addMember', { taskId: this.form.id, team: [userData], text: `added ${userData.label} to task` })
        .then((res) => {
          // console.log(res)
          if (res.statusCode == 200) {
            this.popupMessages.push({text: res.message, variant: "primary-24"})
            this.$store.dispatch('task/fetchTeamMember', { ...this.form }).then(()=>this.reloadTeam += 1)
          } else {
            console.warn(res)
          }
        })
        .catch((err) => {
          console.warn(err)
        })
    },

    async deleteMember(member) {
      // this.newTeam = this.newTeam.filter((item)=>item.id!==member.id);
      // if (this.mode == "task") {
        await this.$store.dispatch("task/deleteMember", { taskId: this.form.id, memberId: member.id, text: `removed ${member.label}` })
          .then((res) => {
            this.$store.dispatch('task/fetchTeamMember', { ...this.form })
          })
          .catch(e => console.warn(e))
      // }
      
    },

    async updateProject(taskData) {

      let proj = this.projects.find(t => t.id == taskData.projValue)

      let user;
      if (taskData.field == 'userId' && taskData.value != "") {
        user = this.teamMembers.filter(u => u.id == taskData.value)
      } else {
        user = null
      }

      this.$store.dispatch("task/updateTask", {
        id: this.form.id,
        data: { [taskData.projField]: taskData.projValue, [taskData.secField]: taskData.secValue },
        user,
        projectId: taskData.oldProjValue,
        projectChanged: true, // do not log history to project
        text: proj ? `changed project to ${proj.title}` : 'Task removed from Project',
      })
        .then((u) => {
          // console.log(u)
          if(this.expandVisible){
          this.$nuxt.$emit("update-key")
          this.reloadHistory += 1
          this.reloadComments+=1
          return;
          }  
         
          if(this.$route.path.includes("/mytasks") && this.mytaskGrid=="grid") {
            this.$nuxt.$emit("update-key")
            this.reloadHistory += 1
            this.reloadComments+=1
            return; 
          }
          if(this.$route.path.includes("/tasks") && this.tasksGrid=="grid") {
            this.$nuxt.$emit("update-key")
            this.reloadHistory += 1
            this.reloadComments+=1
            return;
          }
          if(this.$route.name.includes("projects-id") && this.singleProjectGrid=="grid"){
            this.$nuxt.$emit("update-key")
            this.reloadHistory += 1
            this.reloadComments+=1
            return;
          }
          this.$nuxt.$emit("update_table",u)
          this.reloadHistory += 1
          this.reloadComments+=1

        })
        .catch(e => {
          console.log(e)
        })
    },

    updateTaskform(taskfields){
      this.form = taskfields
      this.createTask(this.form)
    },

    debounceUpdate: _.debounce(function(payload) {
      if (this.form.id) {
        
        if (this.form.priorityId == "") {
          this.form.priority = null
          this.form.priorityId = null
        }
        if (this.form.statusId == "") {
          this.form.status = null
          this.form.statusId = null
        }
        this.updateTask({
          name: payload.name,
          field: payload.field,
          value: payload.value,
          historyText: `changed ${payload.name} to ${payload.value}`
        })
        this.reloadComments += 1

      } else {
        // if new task
        // this.$refs.taskTitleInput.blur()
        this.form.projectId = this.project?.id || ""
        this.form.userId = this.sideBarUser?.id || this.sideBarUser || "";
        this.form.title=payload.value?payload.value:"";
        this.createTask(this.form)
        this.$store.dispatch("user/setSideBarUser",[])
        
      }
    }, 600),
    setExpand() {
      this.$store.commit("task/setExpandVisible", false)
    },
    setFavorite() {
      this.favProcess = true
      if (this.isFavorite.status) {
        this.$store.dispatch("task/removeFromFavorite", { id: this.currentTask.id })
          .then(msg =>{
            this.popupMessages.push({ text: msg, variant: "primary-24" })
            if(this.$route.path=="/favorites"){
             this.$nuxt.$emit("update-key",msg)
            }
          })
          .catch(e => console.log(e))
          
          .then(()=>this.favProcess = false)
      } else {
        this.$store.dispatch("task/addToFavorite", { id: this.currentTask.id })
          .then(msg => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
            if(this.$route.path=="/favorites"){
             this.$nuxt.$emit("update-key",msg)
            }
          })
          .catch(e => console.log(e))
          .then(()=>this.favProcess = false)
      }
    },
    markComplete() {
      this.loading = true
      this.$store.dispatch('task/updateTaskStatus', this.currentTask)
        .then((d) => {
          if(this.$route.path.includes("/mytasks") && this.mytaskGrid=="grid") {
            this.$nuxt.$emit("update-key")
           this.$store.dispatch("task/setSingleTask", d)
            this.reloadHistory += 1
            this.reloadComments+=1
            return; 
          }
          if(this.$route.path.includes("/tasks") && this.tasksGrid=="grid") {
            this.$nuxt.$emit("update-key")
            this.$store.dispatch("task/setSingleTask", d)
            this.reloadHistory += 1
            this.reloadComments+=1
            return;
          }
          if(this.$route.name.includes("projects-id") && this.singleProjectGrid=="grid"){
            this.$nuxt.$emit("update-key")
            this.$store.dispatch("task/setSingleTask", d)
            this.reloadHistory += 1
            this.reloadComments+=1
            return;
          }
          
          this.loading = false
          this.$nuxt.$emit("update_table",d)
          this.$store.dispatch("task/setSingleTask", d)
          this.reloadHistory += 1
          this.reloadComments+=1
          
        }).catch(e => {
          console.log(e)
          this.loading = false
        })
    },
    deleteTaskConfirm(task){
      this.taskConfirmModal = true
      // this.todoToDelete = task
    },

    deleteTask(confirm) {

      // if (task) { 
        this.$store.dispatch("task/deleteTask", {...this.form, retainSubtasks: confirm})
        .then(t => {
          this.taskConfirmModal = false
          if (t.statusCode == 200) {
            this.$nuxt.$emit("close-sidebar");
            this.$nuxt.$emit("update-key", t.message)
          } else {
            this.popupMessages.push({text: t.message, variant: "primary-24"})
            console.warn(t.message);
          }
        })
        .catch(e => {
          this.taskConfirmModal = false
          console.warn(e)
        })
      // } 
    },
    onFileInput(payload) {
      this.value.files = payload.files
    },
    onsubmit(data) {
      // let trimComment = this.$lodash.truncate(data.text.slice(3, -4), { length: 128 })
      let trimComment = stripHTMLandTrim(data.text, 128)
      // console.log(trimComment)

      if (this.editMessage?.id) {
        this.$store.dispatch("task/updateTaskComment", { taskId: this.currentTask.id, commentId: this.editMessage.id, comment: data.text, text: `updated comment ${trimComment}` })
        .then(res => {
          this.reloadHistory += 1
          this.reloadComments+=1
          this.editMessage = {}
        })
        .catch(e => console.log(e))
      } else {
        this.$store.dispatch("task/createTaskComment", { id: this.currentTask.id, comment: data.text, text: `added comment ${trimComment}` })
          .then(res => {
            if (this.value.files.length > 0) {
              this.uploadFiles(this.value.files, res.data)
            }
            this.reloadHistory += 1
          this.reloadComments+=1
          })
          .catch(e => console.log(e))
      }
    },

    async uploadFiles(files, commentRes) {
      let filelist = []

      let formdata = new FormData()
      files.forEach(file => {
        formdata.append('files', file)
        filelist.push(file.name)
      })
      formdata.append('taskId', commentRes.taskId)
      formdata.append('taskCommentId', commentRes.id)
      formdata.append('text', `uploaded file(s) "${filelist.join(", ")}" to task`)

      const fi = await this.$axios.post("/file/upload", formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (fi.data.statusCode == 200) {
        this.reloadFiles += 1;
        this.value.files = []
      }
    },

    // subtask detail
    viewSubtask(subtask){
      this.showSubtaskDetail = true
      this.$store.dispatch("subtask/setSelectedSubtask", subtask)
    },

    copyTaskLink() {
      let url = window.location.host + `/tasks/${this.currentTask.id}`;

      if (navigator.clipboard) { 
        navigator.clipboard.writeText(url);
      } else { 
        unsecuredCopyToClipboard(url);
      }
    },
    
    async getTags(){
      if (this.form.id) {
        const tags = await this.$axios.get("/tag/task/"+this.form.id, {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          }
        })
        // console.log(tags.data)
        if (tags.data.statusCode == 200) {
          this.tags = tags.data.data.map(t => t.tag)
        }
      }
    },

    addTag(tag){
      if (tag.id) {
        // console.log('existing tag->', tag.id, tag.content)
        this.$axios.post("/tag/assign-to-task",  { tagId: tag.id, taskId: this.form.id }, {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          }
        })
        .then(res => {
          // console.log(res)
          this.getTags()
          // this.$nuxt.$emit("update-key","tagStatus")
        })
        .catch(e => console.error(e))
      } else {
        // console.log('new tag->', tag)
        let tagExist = this.alltags.find(t => t.content == tag)
        if (tagExist) {
          // console.log('tag already exists', tag)
          this.popupMessages.push({text: "tag already exists", variant: "primary-24"})
          return
        } else {
          this.$store.dispatch("company/addCompanyTag", {content: tag})
          .then((res)=>{
            // console.log(res.data)
            if (res.data.statusCode == 200) {
              this.$store.dispatch("company/fetchCompanyTags")
              this.$axios.post("/tag/assign-to-task",  { tagId: res.data.data.id, taskId: this.form.id }, {
                headers: {
                  "Authorization": "Bearer " + localStorage.getItem("accessToken"),
                }
              }).then((res) => {
                // console.log(res)
                this.getTags()
                // this.$nuxt.$emit("update-key")
              }).catch(e=>console.error(e))
            } else {
              console.warn("error creating tag")
            }
          })
          .catch(e=>console.error(e))
        }
      }
    },

    removeTag(tag){
      // console.log(tag)
      this.$axios.delete("/tag/remove-from-task", {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          "tagid": tag.id,
          "taskid": this.form.id,
        }
      }).then(res => {
        // console.log(res.data.message)
        this.getTags()
        // this.$nuxt.$emit("update-key","tagStatus")
      }).catch(e => console.warn(e))
    },
    beforeDestroy(){
    this.$nuxt.$off("update_table");
    this.$nuxt.$off("newTask");
  },
  },
};

</script>
<style lang="scss" scoped>
.expandVisible {
  position: absolute; 
  left: 50%;
  right:50%;
  top: 16px !important;
  transform: translate(-50%);
  border-radius: 4px;
}
.side-panel {
  display: grid;
  grid-template-rows: 1fr minmax(40vh, 80vh) 1fr;
  color: var(--bib-secondary);
}

.editable-input { border-color: var(--bib-light); }
.multiline {
  box-sizing: border-box;
  resize: none;
  overflow: hidden;
  inset: 0.25rem 1.5rem 0.5rem;
  width: calc(100% - 3rem);
  height: calc(100% - 1rem);
}
.pseudo-title {
  visibility: hidden;
  min-height: 1.75rem;
  font-size: 1.125rem;
  pointer-events: none;
  padding: 0.2rem 0.4rem;
  border: 1px solid transparent;
}

.row {
  padding: 0 1rem;

  .input {
    color: #ccc;
  }
}



</style>
