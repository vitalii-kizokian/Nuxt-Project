<template>
  <section id="sd-wrapper" class="position-absolute subtask-detail-wrapper bg-white">
    <div id="sd-header">
      
      <!-- top row -->
      <div class="d-flex align-center justify-between pt-105 px-105 pb-05" id="sd-toolbar-wrapper">
        <div class="" id="sd-mark-button-wrapper">
           <bib-button :label="isComplete.text" :variant="isComplete.variant" icon="check-circle-solid" @click="markComplete"></bib-button>
        </div>
        
        <div class="d-flex gap-05 align-center" id="sd-icons-wrapper">
          <div class="p-025 cursor-pointer bg-light bg-hover-gray2 shape-circle width-2 height-2 d-flex align-center justify-center" id="std-icon-6" v-tooltip="isFavorite.text" @click="setFavorite">
            <bib-icon icon="bookmark-solid" :variant="isFavorite.variant" ></bib-icon>
          </div>
          <div class="cursor-pointer bg-light bg-hover-gray2 shape-circle width-2 height-2 d-flex align-center justify-center" id="std-icons">
            <bib-button pop="elipsis" >
              <template v-slot:menu>
                <div class="list" id="std-list">
                  <span class="list__item" id="std-list-item-1" @click="markComplete">
                    <bib-icon icon="check-circle-solid" :variant="isComplete.iconVariant" class="mr-05"></bib-icon> {{isComplete.text}}
                  </span>
                  <span class="list__item" id="std-list-item-2" @click="setFavorite">
                    <bib-icon icon="bookmark-solid" :variant="isFavorite.variant" class="mr-05"></bib-icon> {{isFavorite.text}}
                  </span>
                  
                  <hr>
                  <!-- <span class="list__item list__item__danger" id="std-list-item-8" @click="$nuxt.$emit('delete-subtask', subtask)">Delete</span> -->
                  <span class="list__item list__item__danger" 
                      @mouseenter="deleteBtnHover = true"
                      @mouseleave="deleteBtnHover = false" 
                      id="std-list-item-8" @click="$nuxt.$emit('delete-subtask', subtask)">
                    <bib-icon icon="trash" :variant='deleteBtnHover ? `white` : `danger`' class="mr-05"></bib-icon> Delete 
                  </span>
                </div>
              </template>
            </bib-button>
          </div>
          <div class="shape-circle bg-hover-light width-2 height-2 d-flex cursor-pointer" id="sd-page-last-icon" title="Close" @click="closeSidebarDetail"><bib-icon icon="page-last" class="m-auto"></bib-icon></div>
        </div>
      </div>
      <!-- go to parent  -->
      <div class="px-105" id="std-parent">
        <div v-show="project?.title" >
          <span id="sd-goToProject" class="cursor-pointer subtask-info " @click="gotoProject">{{project?.title}}</span>
        </div>
        <div class="d-inline-flex align-center pb-025">
          <span id="sd-goToParent" class="cursor-pointer subtask-parent-task subtask-info text-truncate" @click="gotoParent">{{form?.task?.title}}</span> <bib-icon icon="arrowhead-right" :scale="0.9" variant="gray"></bib-icon>
        </div>
      </div>
      <!-- title input -->
      <div class="border-bottom-gray3 position-relative px-105 py-05 mb-1" id="std-fields-wrap">
        <textarea id="std-title-input" class="editable-input multiline position-absolute" v-model="form.title" :class="{'error': error == 'invalid'}" ref="subtaskTitleInput" placeholder="Enter title..." v-on:keyup="debounceUpdateField({field: 'title', value: form.title, name: 'Title'})" v-on:keydown.enter.prevent></textarea>
        <div class="pseudo-title" aria-hidden="true" role="textarea">{{form.title}}</div>
      </div>
    </div>

    <!-- other fields -->
    <div class="overflow-y-auto d-grid" id="std-other-fields" style="grid-template-columns: none; align-items: start">
      <div class="border-bottom-gray3 px-105 py-05">
        <div class="align-center gap-05" >
          <span class="font-sm text-gray6" style="white-space: nowrap;">Assigned to</span> 
          <div class="mr-1" style="flex-basis: 2rem;">
            <user-select-two :userId="form.userId" mode="avatar" minWidth="15rem" maxWidth="18rem" @change="updateAssignee" ></user-select-two> 
          </div>
        
          <div class="align-center height-2 cursor-pointer" >             
            <user-select-two userId="" mode="icon" title="Add to team" min-width="15rem" max-width="18rem" @change="addTeamMember"></user-select-two>
            <team-list-two :team="team" @delete-member="deleteMember"></team-list-two>
          </div>
        </div>
      </div>
      
      <div class="subtask-info position-relative py-05 px-105" id="sd-input-wrap">
        <div class="row mt-05 mb-05" id="sd-other-fields-row1">
          <div class="col-2 align-center" id="sd-other-fields-r1-c1"><label>Start Date</label></div>
          <div class="col-4" id="sd-other-fields-r1-c2">
            <bib-datetime-picker v-model="sdate" :format="format" :parseDate="parseDate" :formatDate="formatDate" variant="gray4" size="sm" placeholder="Start date" @input="startdateProcess" ></bib-datetime-picker>
          </div>
        </div>
        <div class="row mt-05 mb-05" id="sd-other-fields-row2">
          <div class="col-2 align-center" id="sd-other-fields-r2-c1"><label>Due Date</label></div>
          <div class="col-4" id="sd-other-fields-r2-c2">
            <bib-datetime-picker v-model="ddate" :format="format" :parseDate="parseDate" :formatDate="formatDate" variant="gray4" size="sm" placeholder="Due date" :class="{'past-due': overdue}" @input="duedateProcess"></bib-datetime-picker>
          </div>
        </div>
        <div class="row mt-05 mb-05" id="sd-other-fields-row3">
          <div class="col-2 align-center" id="sd-other-fields-r3-c1"><label>Department</label></div>
          <div class="col-5" id="sd-other-fields-r3-c2">
            <select-two :options="departments" :value="form.departmentId" icon="projects" title="Department" @change="updateSubtask({name: 'Department', field:'departmentId', value: $event.value, text: $event.label})"></select-two>
          </div>
        </div>
        <div class="row mt-05 mb-05"  id="sd-other-fields-row4">
          <div class="col-2 align-center" id="sd-other-fields-r4-c1"><label>Priority</label></div>
          <div class="col-5"  id="sd-other-fields-r4-c2">
            <priority-select-two :priority="form.priority" @change="updateSubtask({name: 'Priority', field: 'priorityId', value: $event.value, text: $event.label})"></priority-select-two>
          </div>
        </div>
        <div class="row mt-05 mb-05"  id="sd-other-fields-row5">
          <div class="col-2 align-center" id="sd-other-fields-r5-c1"><label>Status</label></div>
          <div class="col-5" id="sd-other-fields-r5-c2">
            <status-select-two :status="form.status" @change="updateSubtask({name: 'Status', field: 'statusId', value: $event.value, text: $event.label})" ></status-select-two>
          </div>
        </div>
        <div class="row mt-05 mb-05 " id="sd-other-fields-row6">
          <div class="col-2 align-center" id="sd-other-fields-r6-c1"><label>Difficulty</label></div>
          <div class="col-5" id="sd-other-fields-r6-c2">
            <select-two :options="difficultyOpt" :value="form.difficultyId" icon="bib-logo" title="Difficulty" @change="updateSubtask({name: 'Difficulty', field: 'difficultyId', value: $event.value, text: $event.label})" ></select-two>
          </div>
        </div>
        <div class="row mt-05 mb-05 " id="sd-other-fields-row7">
          <div class="col-2 align-center" id="sd-other-fields-r7-c1"><label>Est. Days</label></div>
          <div class="col-5" id="sd-other-fields-r7-c2">
            <input-two :value="form.estDays" icon="calendar-solid" @input="debounceUpdateField({name: 'Est. Days', field: 'estDays', value: $event})" ></input-two>
          </div>
        </div>
        <div class="row mb-05 " id="sd-other-fields-row8">
          <div class="col-2 align-center" id="sd-other-fields-r8-c1"><label>Budget</label></div>
          <div class="col-5" id="sd-other-fields-r8-c2">
            <input-two :value="form.budget" icon="currency-dollar" @input="debounceUpdateField({name: 'Budget', field: 'budget', value: $event})" ></input-two>
          </div>
        </div>
        <div class="row " id="sd-other-fields-row7">
          <div class="col-12" id="sd-other-fields-r7-c1">
            <div class="mb-05" id="sd-other-fields-r9-c1"><label>Desciption</label></div>
            <rich-editor :value="value" :editingMessage="form.description" @submit="$emit('subtask-desc',{ id: form.id, name: 'Description', field: 'description', value: $event.text})" ></rich-editor>
          </div>
        </div>
      </div>

      <sidebar-tag :activeProp="true" :tags="tags" @add-tag="addTag" @change="addTag" @delete-tag="removeTag" ></sidebar-tag>

      <div class="pb-05 px-105" id="std-conv-wrap">
        <sidebar-files :activeProp="true" id="subtask_files" mode="subtask" :reloadFiles="reloadFiles"></sidebar-files>

        <div class="d-flex justify-between sub-title mb-05  " id="std-conv-heading">
          <p class="text-gray5 font-md " id="std-conv-para-text">Conversation </p>
        </div>
        <div v-if="loadingComments" class="my-05" id="sd-loading-comments">
          <div class="d-inline-flex gap-05 align-center " id="sd-loading-comments-inner">
            <div class="shape-circle width-2 height-2 animated-background" id="sd-shape-circle"></div>
            <div>
              <div class="animated-background width-10 mb-025" id="sd-animated-bg-w10" style="height: 0.8rem"></div>
              <div class="animated-background width-7" id="sd-animated-bg-w7" style="height:0.6rem"></div>
            </div>
          </div>
        </div>
        <template v-else-if="sortedData.length > 0">
          <div v-for="(item, index) in sortedData" :id="'std-sortedData-'+index" :key="index">
            <message v-if="item.comment" :msg="item" fieldkey="subtask" @delete-message="onDeleteMessage"></message>
            <task-history v-if="item.text && !item.isHidden" :history="item"></task-history>
          </div>
        </template>

      </div>
    </div>
    <!-- message input -->
    <div class="task-message-input d-flex gap-1 border-top-gray3 py-1 px-105" id="sd-avatar-mi-wrap">
      <bib-avatar :src="user2.Photo" size="2rem" class="flex-shrink-0"></bib-avatar>
      <message-input class="flex-grow-1" :value="value" key="taskMsgInput" :editingMessage="editMessage" @input="onFileInput" @submit="onsubmit"></message-input>
    </div>

    <bib-modal-wrapper v-if="taskTeamModal" title="Team" size="lg" @close="taskTeamModal = false">
      <template slot="content">
        <div style="min-height: 12rem;" id="std-task-team">
          <task-team :task="subtask" mode="subtask" ></task-team>
        </div>
      </template>
    </bib-modal-wrapper>
    <bib-popup-notification-wrapper>
      <template #wrapper>
        <bib-popup-notification v-for="(msg, index) in popupMessages" :key="index" :message="msg.text" :variant="msg.variant" :autohide="4000">
        </bib-popup-notification>
      </template>
    </bib-popup-notification-wrapper>
  </section>
</template>

<script>
import { STATUS, PRIORITY, DIFFICULTY } from '~/config/constants.js'
import { mapGetters, mapActions } from 'vuex'
import _ from 'lodash'
export default {

  name: 'SubtaskDetail',
  props: {
    showTaskTitle: { type: Boolean, default: true },
    titleClick: { type: String, default: "close" }
  },
  data() {
    return {
      statusValues: STATUS,
      priorityValues: PRIORITY,
      difficultyOpt: DIFFICULTY,
      error: '',
      loading: false,
      loadingComments: false,
      value: {
        files: []
      },
      editMessage: {},
      reloadFiles: 0,
      taskTeamModal: false,
      popupMessages: [],
      format: "DD MMM YYYY",
      sdate: "",
      ddate: "",
      tags: [],
      deleteBtnHover: false
    }
  },
  computed: {
    ...mapGetters({
      user2: "user/getUser2",
      subtask: "subtask/getSelectedSubTask",
      team: 'subtask/getSubtaskMembers',
      favsubtasks: "subtask/getFavSubtasks",
      subtaskComments: "subtask/getSubTaskComments",
      subtaskHistory: "subtask/getSubtaskHistory",
      teamMembers: "user/getTeamMembers",
      departments: "department/getAllDepartments",
      alltags: "company/getCompanyTags",
      currentTask: "task/getSelectedTask",
      project: "project/getSingleProject",
    }),

    orgUsers() {
      let data = this.teamMembers
        .map(u => {
          return { label: u.firstName + ' ' + u.lastName, img: u.avatar, value: u.id }
        })
      return [{ label: 'Please select...', value: null }, ...data]
    },

    form: {
      get() {
        return _.cloneDeep(this.subtask)
      },
      set(newValue) {
      }
    },

    isComplete() {
      if (this.form.statusId == 5) {
        return { variant: "primary-24", iconVariant: "primary-24", text: "Completed" }
      } else {
        return { variant: "primary--outline", iconVariant: "gray4", text: "Mark Completed" }
      }
    },

    /*assignee() {
      if (this.teamMembers.length > 0 && this.form.userId) {
        return this.teamMembers.find((m) => m.id == this.form.userId)
      } else {
        return { Name: "no user found" }
      }
    },*/
    startDateInput: {
      get() {
        if (!this.form.startDate) {
          return null
        } else {
          return new Date(this.form.startDate)
        }
      },
      set(newValue) {
        this.$refs.startDate.variant = null;
        if (!newValue) this.form.startDate = "";
        else {
          const newStartDate = new Date(newValue);
          if (
            this.dueDateInput &&
            newStartDate.toISOString().slice(0, 10) >
              this.dueDateInput.toISOString().slice(0, 10)
          ) {
            this.popupMessages.push({ text:"Invalid date", variant: "danger" });
            this.dueDateInput = "";
            this.$nextTick(() => {
              this.$refs.dueDate.$emit("input");
            });
            this.$refs.startDate.variant = "alert";
          } else {
            if (this.$refs.dueDate.variant) this.$refs.dueDate.variant = null;
          }
          this.form.startDate = new Date(newValue);
          this.$emit("update-field", {
            name: "Start date",
            field: "startDate",
            value: newStartDate,
          });
        }
      },
    },
    dueDateInput: {
      get() {
        if (!this.form.dueDate) {
          return null
        } else {
          return new Date(this.form.dueDate)
        }
      },
      set(newValue) {
        this.$refs.dueDate.variant = null;
        if (!newValue) {
          this.form.dueDate = "";
        } else {
          const newDueDate = new Date(newValue);
          if (
            this.startDateInput &&
            newDueDate.toISOString().slice(0, 10) <
              this.startDateInput.toISOString().slice(0, 10)
          ) {
            this.popupMessages.push({ text:"Invalid date", variant: "danger" });
            this.startDateInput = "";
            this.$nextTick(() => {
              this.$refs.startDate.$emit("input");
            });
            this.$refs.dueDate.variant = "alert";
          } else {
            if (this.$refs.startDate.variant)
              this.$refs.startDate.variant = null;
          }
          this.form.dueDate = newDueDate;
          this.$emit("update-field", {
            name: "Due date",
            field: "dueDate",
            value: newDueDate,
          });
        }
      },
    },
    sortedData() {
      let s = [...this.subtaskComments, ...this.subtaskHistory]
      if (s.length > 0) {
        return s.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
      } else {
        return []
      }
    },
    isFavorite(){
        let fav = this.favsubtasks.findIndex(fv => fv.subtaskId == this.subtask.id)
        if (fav >= 0) {
            return { variant: "primary-24", text: "Remove favorite", status: true }
        } else {
            return { variant: "gray4", text: "Add to favorites", status: false }
        }
    },
    overdue() {
      let diff = this.$dayjs().diff(this.ddate, 'd')
      return (diff >= 1) ? true : false
    },
  },
  
  watch: {
    subtask (newVal, oldVal) {
      if (newVal != oldVal) {
        // console.log('watch subtask change')
        this.fetchSubtaskMembers(this.subtask)
        this.fetchSubtaskComments(this.subtask)
        this.fetchSubtaskHistory(this.subtask)
        this.getTags()
        this.sdate = this.$formatDate(this.subtask?.startDate)
        this.ddate = this.$formatDate(this.subtask?.dueDate)
      }
    }
  },

  created() {
    this.$nuxt.$on("edit-message", (msg) => {
      this.editMessage = msg
    })
  },

  mounted() {
    this.$store.dispatch("subtask/fetchSubTask", this.subtask)
    this.$store.dispatch("subtask/fetchSubtaskMembers", this.subtask)
    this.$store.dispatch("subtask/fetchFavorites")

    this.loadingComments = true
    this.$store.dispatch("subtask/fetchSubtaskComments", this.subtask)
      .then(subc => { this.loadingComments = false })
      .catch(e => {
        console.warn(e)
        this.loadingComments = false
      })

    this.$store.dispatch("subtask/fetchSubtaskHistory", this.subtask)
  },
  methods: {

    ...mapActions({
      fetchSubtaskMembers: "subtask/fetchSubtaskMembers",
      fetchSubtaskComments: "subtask/fetchSubtaskComments",
      fetchSubtaskHistory: "subtask/fetchSubtaskHistory",
    }),

    /*showAddTeamModal() {
      this.taskTeamModal = true
    },*/
    parseDate(dateString, format) {
      return new Date(dateString);
    },
    formatDate(dateObj, format) {
      return this.$formatDate(dateObj)
    },
    startdateProcess(newValue, repeat){
      const oldValue = this.form.startDate
      const newStartDate = new Date(newValue);
      this.form.startDate = newValue;

      // console.table({"newvalue":newValue, "newstartdate":newStartDate, "oldvalue":oldValue, "sdate":this.sdate})

      if (newValue == "") {
        this.$store.dispatch("subtask/updateSubtask", {
          id: this.form.id,
          data: {startDate: null},
          // user,
          text: "removed Start date"
        })
        return
      }

      if (this.form.dueDate && this.form.dueDate != null) {

            let dueDate = new Date(this.form.dueDate);
            let dueDateUTC = new Date(Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()));
            dueDateUTC.setUTCHours(0, 0, 0, 0);
            
            let startDateUTC = new Date(Date.UTC(newStartDate.getUTCFullYear(), newStartDate.getUTCMonth(), newStartDate.getUTCDate()));
            startDateUTC.setUTCHours(0, 0, 0, 0);

        if (startDateUTC.getTime() > dueDateUTC.getTime()) {
          this.popupMessages.push({ text: "Start date should be before Due date", variant: "danger" });
          this.form.startDate = oldValue
          this.sdate = this.$formatDate(oldValue)
          // return
        } else {
          this.$store.dispatch("subtask/updateSubtask", {
            id: this.form.id,
            data: {startDate: newStartDate},
            // user,
            text: `updated Start date to ${newValue}`
          }).then ((res)=>{
            if (res.statusCode == 200) {
              this.$store.dispatch("subtask/setSelectedSubtask", res.data)
              this.$store.dispatch('subtask/fetchSubTask', res.data).then((res) => {
                this.form = res;
                this.$nuxt.$emit("update_table",res)
              })
              this.$store.dispatch("subtask/fetchSubtaskHistory", this.subtask)
            } else {
              console.warn(sub.statusCode, sub.message)
              this.popupMessages.push({text: sub.message, variant: "danger"})
            }
          })
        }
      } else {
        this.$store.dispatch("subtask/updateSubtask", {
          id: this.form.id,
          data: {startDate: newStartDate},
          // user,
          text: `updated Start date to ${newValue}`
        }).then ((res)=>{
          if (res.statusCode == 200) {
              this.$store.dispatch("subtask/setSelectedSubtask", res.data)
              this.$store.dispatch('subtask/fetchSubTask', res.data).then((res) => {
                this.form = res;
                this.$nuxt.$emit("update_table",res)
              })
              this.$store.dispatch("subtask/fetchSubtaskHistory", this.subtask)
            } else {
              console.warn(sub.statusCode, sub.message)
              this.popupMessages.push({text: sub.message, variant: "danger"})
            }
        })
      }

    },

    duedateProcess(newValue, repeat){
      const oldValue = this.form.dueDate
      const newDueDate = new Date(newValue);
      this.form.dueDate = newValue;

      // console.table({"newvalue": newValue, "newduedate":newDueDate, "oldvalue":oldValue, "ddate":this.ddate})

      if (newValue == "") {
        this.$store.dispatch("subtask/updateSubtask", {
          id: this.form.id,
          data: {dueDate: null},
          // user,
          text: `updated Due date to ${newValue}`
        })
        return
      } 

      if (this.form.startDate && this.form.startDate != null) {

            let selectedDateUTC = new Date(Date.UTC(newDueDate.getUTCFullYear(), newDueDate.getUTCMonth(), newDueDate.getUTCDate()));
            selectedDateUTC.setUTCHours(0, 0, 0, 0);

            let startDueDate = new Date(this.form.startDate);
            let startDateUTC = new Date(Date.UTC(startDueDate.getUTCFullYear(), startDueDate.getUTCMonth(), startDueDate.getUTCDate()));
            startDateUTC.setUTCHours(0, 0, 0, 0);

          // console.log(this.form.startDate )
        if (selectedDateUTC.getTime() < startDateUTC.getTime()) {
          this.popupMessages.push({ text: "Due date should be after Start date", variant: "danger" });
          this.form.dueDate = oldValue
          this.ddate = this.$formatDate(oldValue)
          // return
        } else {
         this.$store.dispatch("subtask/updateSubtask", {
            id: this.form.id,
            data: {dueDate: newDueDate},
            // user,
            text: `updated Due date to ${newValue}`
          }).then((res)=>{
            if (res.statusCode == 200) {
              this.$store.dispatch("subtask/setSelectedSubtask", res.data)
              this.$store.dispatch('subtask/fetchSubTask', res.data).then((res) => {
                this.form = res;
                this.$nuxt.$emit("update_table",res)
              })
              this.$store.dispatch("subtask/fetchSubtaskHistory", this.subtask)
            } else {
              console.warn(sub.statusCode, sub.message)
              this.popupMessages.push({text: sub.message, variant: "danger"})
            }
          })

        }
      } else {
        this.$store.dispatch("subtask/updateSubtask", {
          id: this.form.id,
          data: {dueDate: newDueDate},
          // user,
          text: `updated Due date to ${newValue}`
        }).then ((res)=>{
          if (res.statusCode == 200) {
              this.$store.dispatch("subtask/setSelectedSubtask", res.data)
              this.$store.dispatch('subtask/fetchSubTask', res.data).then((res) => {
                this.form = res;
                this.$nuxt.$emit("update_table",res)
              })
              this.$store.dispatch("subtask/fetchSubtaskHistory", this.subtask)
            } else {
              console.warn(sub.statusCode, sub.message)
              this.popupMessages.push({text: sub.message, variant: "danger"})
            }
        })
      }
      
    },

    fetchComments() {
      this.loadingComments = true
      this.$store.dispatch("subtask/fetchSubtaskComments", this.subtask)
        .then(subc => { this.loadingComments = false })
        .catch(e => {
          console.warn(e)
          this.loadingComments = false
        })
    },
    markComplete() {
      if (this.form.isDone) {
        this.form.statusId = 2
        this.form.isDone = false
      } else {
        this.form.isDone = true
        this.form.statusId = 5
      }
      this.updateSubtask({ field: 'statusId', value: this.form.statusId, name: 'Status', isDone: this.form.isDone })
    },

    setFavorite() {

      if (this.isFavorite.status) {
        this.$axios.delete("subtask/"+this.subtask.id+"/favorite", { 
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("accessToken"),
            } 
        })
          .then(msg => {
            console.log(msg.data.message)
            this.popupMessages.push({ text: "Removed From Favorites", variant: "primary-24" })

            this.$store.dispatch("subtask/fetchFavorites")
        })
          .catch(e => console.log(e))
      } else {
        this.$axios.post("subtask/"+this.subtask.id+"/favorite", {}, { 
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("accessToken"),
            } 
        })
          .then(msg => {
            this.popupMessages.push({ text:"Added To Favorites", variant: "primary-24" })

            console.log(msg.data.message)
            this.$store.dispatch("subtask/fetchFavorites")

        })
          .catch(e => console.log(e))
      }
    },

    async updateAssignee(userData){
      // console.log(userData)

      const sub = await this.$store.dispatch("subtask/updateSubtask", {
        id: this.form.id,
        data: { userId: userData.id },
        user: [userData],
        text: `changed Assignee to ${userData.label}`
      })
      // console.log(sub)
      if (sub.statusCode == 200) {
        this.$store.dispatch("subtask/setSelectedSubtask", sub.data)
        this.$store.dispatch('subtask/fetchSubTask', sub.data).then((res) => {
          this.form = res;
          this.$nuxt.$emit("update_table",res)
        })
        this.$store.dispatch("subtask/fetchSubtaskHistory", this.subtask)
      } else {
        console.warn(sub.statusCode, sub.message)
        this.popupMessages.push({text: sub.message, variant: "danger"})
      }
    },

    addTeamMember(member){
      // console.log(member)
      this.$store.dispatch("subtask/addMembers", {
        id: this.form.id,
        team: [member],
        text: `added ${member.label} to subtask`
      })
        .then(() => {
          this.$store.dispatch("subtask/fetchSubtaskMembers", { id: this.form.id, userId: this.form.userId })
        })
        .catch((err) => {
          console.log(err)
        })
    },

    deleteMember(member){
      // console.log(member)
      this.$store.dispatch("subtask/deleteMember", {
        id: this.form.id,
        memberId: member.id,
        text: `removed ${member.label} from subtask`
      })
      .then((res) => {
        if(res.statusCode == 200) {
          this.popupMessages.push({text: res.message, variant: "primary-24"})
          this.$store.dispatch('subtask/fetchSubtaskMembers', { id: this.form.id })
        }
      })
      .catch(e => console.log(e))
    },

    async updateSubtask(data) {
      let updata = {[data.field]: data.value}
      
      if (data.name == 'Status' && data.value == 5) {
        updata = { [data.field]: data.value, isDone: true }
      }
      
      if (data.name == 'Status' && data.value != 5) {
        updata = { [data.field]: data.value, isDone: false }
      }
      // console.log(data, updata)
      
      const sub = await this.$store.dispatch("subtask/updateSubtask", {
        id: this.form.id,
        data: updata,
        text: `updated ${data.name} to ${data.text || data.value}`
      })
      console.log(sub)
      if (sub.statusCode == 200) {
        // this.$store.dispatch("subtask/setSelectedSubtask", sub.data)
        this.$store.dispatch('subtask/fetchSubTask', sub.data).then((res) => {
          this.form = res;
          console.log(res)
          this.$nuxt.$emit("update_table",res)
        })
        this.$store.dispatch("subtask/fetchSubtaskHistory", this.subtask)
      } else {
        console.warn("error")
      }
    },
    closeSidebarDetail() {
      this.$nuxt.$emit('close-sidebar')
      // this.$emit('close-sidebar-detail')
      this.$store.dispatch("subtask/setSelectedSubtask", "")
    },
    gotoProject(){
      this.closeSidebarDetail()
      this.$router.push("/projects/" + this.project.id);
    },
    gotoParent(){
      this.$emit('close-sidebar-detail')
      this.$store.dispatch("subtask/setSelectedSubtask", "")
      // if (this.titleClick == "task") {
      //   window.open('/tasks/'+this.form.task?.id)
      // } else {
      //   this.closeSidebarDetail()
      // }
    },

    debounceUpdateField: _.debounce(function(data) {
      if (this.form?.id) {
        this.updateSubtask(data)
      }
    }, 800),

    onFileInput(payload) {
      this.value.files = payload.files
    },

    onsubmit(data) {
      let trimComment = _.truncate(data.text.slice(3, -4), { length: 128 })

      if (this.editMessage?.id) {
        this.$store.dispatch("subtask/updateSubtaskComment", { subtaskId: this.subtask.id, commentId: this.editMessage.id, comment: data.text, text: `updated comment ${trimComment}` })
          .then(res => {
            this.editMessage = {}
          })
          .catch(e => console.log(e))
      } else {
        this.$store.dispatch("subtask/createSubtaskComment", { id: this.subtask.id, comment: data.text, text: `added comment "${trimComment}"` }).then(res => {
            if (res.data.statusCode == 200) {
              this.fetchSubtaskComments({id: res.data.subtaskId})
            }
            if (this.value.files.length > 0) {
              this.uploadFiles(this.value.files, res.data)
            }
          })
          .catch(e => console.log(e))
      }
    },

    async uploadFiles(files, commentRes) {
      let filelist = []
      // console.log(...arguments)
      let formdata = new FormData()
      files.forEach(file => {
        formdata.append('files', file)
        filelist.push(file.name)
      })
      formdata.append('subtaskId', commentRes.subtaskId)
      formdata.append('subtaskCommentId', commentRes.id)
      formdata.append('text', `uploaded file(s) "${filelist.join(", ")}"`)

      const fi = await this.$axios.post("/file/upload", formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (fi.data.statusCode == 200) {
        this.reloadFiles += 1
        this.value.files = []
        this.$nuxt.$emit("get-msg-files")
      }
    },

    async onDeleteMessage(payload) {
      // console.log(payload)
      this.loadingComments = true
      const del = await this.$store.dispatch("subtask/deleteSubtaskComment", { ...payload, subtaskId: this.subtask.id, text: "subtask comment deleted" });
      if (del.statusCode == 200) {
        this.fetchComments()
      } else {
        console.warn(del.message)
      }
    },

    async getTags(){
      if (this.form.id) {
        const tags = await this.$axios.get("/tag/subtask/"+this.form.id, {
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
        console.log('existing tag->', tag.id, tag.content)
        this.$axios.post("/tag/assign-to-subtask",  { tagId: tag.id, subTaskId: this.form.id }, {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          }
        })
        .then(res => {
          // console.log(res)
          this.getTags()
          this.$nuxt.$emit("update-key")
        })
        .catch(e => console.error(e))
      } else {
        console.log('new tag->', tag)
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
              this.$axios.post("/tag/assign-to-subtask",  { tagId: res.data.data.id, subTaskId: this.form.id }, {
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
      console.log(tag)
      this.$axios.delete("/tag/remove-from-subtask", {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          "tagid": tag.id,
          "subtaskid": this.form.id,
        }
      }).then(res => {
        console.log(res.data.message)
        this.getTags()
        // this.$nuxt.$emit("update-key")
      }).catch(e => console.warn(e))
    }
  }
}

</script>
<style lang="scss" scoped>
.subtask-detail-wrapper {
  inset: 0;
  z-index: 8;
  display: grid;
  grid-template-rows: 1fr minmax(4fr, auto) 1fr;
}
.subtask-info {
  font-size: $font-size-sm;
}
.subtask-parent-task {
  max-width: 500px;
}
#std-parent .subtask-info:hover {
  text-decoration: underline;
  text-decoration-color: $primary-24;
  color: $primary-24 
}
.editable-input { border-color: var(--bib-light)}
.multiline {
  box-sizing: border-box;
  resize: none;
  overflow: hidden;
  inset: 0.25rem 1.5rem;
  width: calc(100% - 3rem);
  height: calc(100% - 0.75rem);
}
.pseudo-title {
  visibility: hidden;
  min-height: 1.75rem;
  font-size: 1.125rem;
  pointer-events: none;
  padding: 0 0.4rem;
  border: 1px solid transparent;
}
::v-deep {
  // .input {

  //   &--sm {
  //     .wrapper {
  //       .icon { top: 0.5rem; }
  //     }
  //   }
  //   input {
  //     display: inline;
  //     margin-block: 0;
  //     width: auto;
  //     min-width: 5rem;
  //     max-width: max-content;
  //     background-color: var(--bib-gray9);
  //     border: 1px solid transparent;
  //     color: var(--bib-secondary);
  //     &:hover, &:focus {
  //       border-color: var(--bib-gray2);
  //       color: var(--bib-text);
  //     }
  //   }
  // }
  .bib-datepicker__input,
  .vdpComponent__input { margin-block: 0;}
}
</style>
