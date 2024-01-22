<template>
  <client-only>
    <div :id="'task-grid-wrapper'+ task.id" class="task-grid position-relative bg-white" @click.stop="$emit('open-sidebar', task)" v-click-outside="() => editTitle = false">
      <!-- <figure v-if="task.cover" :id="'task-card-image'+task.id" class="task-image bg-light" style="background-image:url('https://via.placeholder.com/200x110')"></figure> -->
      <div class="task-top justify-between" :id="'tg-top-wrap'+ task.id">
        <div class="d-flex flex-grow-1" :id="'task-card-inside-wrap'+task.id">
          <span class="cursor-pointer" style="padding-top: 0.15rem;" @click.stop="markComplete(task)">
            <bib-icon icon="check-circle-solid" :scale="1.25" :variant="task.statusId == 5 ? 'success' : 'light'" ></bib-icon>
          </span>
          <span class="flex-grow-1 position-relative" :id="'task-title'+task.id" >
           <!-- <input type="text" class="editable-input-grid" ref="titleInput" v-model="form.title" v-on:click.stop="$emit('open-sidebar', task)"  @input="debounceUpdate('Title', 'title', $event.target.value, $event)" rows="1" @blur="restoreField"> -->
           <div class="editable-input-div py-01 px-025" v-show="!editTitle" @click.stop="makeEditable">{{form.title}}</div>
           <!-- <input type="hidden" v-model="form.title"> -->
           <textarea class="editable-input-grid" v-show="editTitle" ref="titleInput" @focus="textAreaAdjust" @keyup="textAreaAdjust" v-model="form.title" v-on:click.stop="$emit('open-sidebar', task)" @input="debounceUpdate('Title', 'title', $event.target.value, $event)" @blur="restoreField"></textarea>
          </span>
        </div>
        <div class="shape-circle bg-light width-2 height-2 d-flex flex-shrink-0 justify-center align-center">
          <bib-popup pop="elipsis" icon="elipsis" icon-variant="gray5" icon-hover-variant="dark" @click.native.stop="openContextMenu()">
            <template v-slot:menu>
              <div class="list box-shadow" :id="'task-list'+task.id">
                <span v-for="(item, index) in contextMenuItems" :key="item.label+index" class="list__item cursor-pointer" :class=" ['list__item__'+item.variant] " @click.stop="contextItemClick(item)">
                  <bib-icon v-if="item.icon" :icon="item.icon" :variant="activeVariant(item)" class="mr-05"></bib-icon> {{item.label}}
                </span>
              </div>
            </template>
          </bib-popup>
        </div>
      </div>
      <div class="task-mid d-flex gap-05">
        <status-badge v-if="task.statusId" :status="task.status"></status-badge>
        <priority-badge v-if="task.priorityId" :priority="task.priority"></priority-badge>
      </div>
      <div class="task-bottom align-center justify-between gap-025" :id="'tg-bottom'+ task.id">
        <div v-if="task.userId" class="user-info" @click.stop="showUserPicker(task)">
          <user-info :userId="task.userId" maxWidth="7rem" class="events-none"></user-info>
        </div>
        <div v-else class="user-name-blank user-info bg-white shape-circle align-center justify-center" @click.stop="showUserPicker(task)">
          <bib-icon icon="user" variant="gray4" class="events-none"></bib-icon>
        </div>
        <div class="date-input position-relative flex-shrink-0 flex-grow-0">
          <bib-datetime-picker class="left-datetime-picker" v-model="ddate" :class="{'past-due': overdue}" variant="gray4" :format="format" :parseDate="parseDate" :formatDate="formatDate" placeholder="No date" @input="updateDate($event, task, 'dueDate', 'Due Date')" @click.native.stop></bib-datetime-picker>
        </div>
        <!-- <div v-if="task.dueDate" class="align-center gap-025 ml-auto" @click.stop="showDatePicker(task)">
          <bib-icon icon="calendar-solid" :variant="checkPastDue(task.dueDate) ? 'danger-sub3' : 'gray4'" class="events-none"></bib-icon>
          <format-date :datetime="task.dueDate" :variant="checkPastDue(task.dueDate) ? 'danger' : 'gray5'" class="events-none"></format-date>
        </div> -->
        <!-- <div v-else class="date-info-blank date-info shape-circle align-center justify-center ml-auto" @click.stop="showDatePicker(task)">
          <bib-icon icon="calendar" variant="gray4" class="events-none"></bib-icon>
        </div> -->
      </div>
      <!-- popup notification -->
      <bib-popup-notification-wrapper>
        <template #wrapper>
          <bib-popup-notification v-for="(msg, index) in popupMessages" :key="index" :message="msg.text" :variant="msg.variant">
          </bib-popup-notification>
        </template>
      </bib-popup-notification-wrapper>

      <!-- delete confirm -->
      <bib-modal-wrapper v-if="taskDeleteConfirm" title="Delete task" @close="closeConfirm($event)">
        <template slot="content">
          <p>Task will be deleted permanently and wont be recoverable</p>
          <loading :loading="loading"></loading>
        </template>
        <template slot="footer">
            <div v-show="!loading" class="justify-between gap-1">
              <bib-button label="Cancel" variant="secondary" pill @click.native.stop="closeConfirm"></bib-button>
              <bib-button label="Delete" variant="danger" pill @click.native.stop="deleteTask"></bib-button>
            </div>
        </template>
      </bib-modal-wrapper>
      <!-- confirm delete task -->
      <!-- <confirm-dialog v-if="confirmModal" :message="confirmMsg" @close="confirmDelete"></confirm-dialog> -->
      <alert-dialog v-show="alertDialog" :message="alertMsg" @close="alertDialog = false"></alert-dialog>
    </div>
  </client-only>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
// import dayjs from 'dayjs'
import { TASK_CONTEXT_MENU } from "../../config/constants";
import { unsecuredCopyToClipboard } from '~/utils/copy-util.js'
import { pastDue } from "~/utils/helpers.js";

/*var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)*/

export default {
  name: "TaskGrid",
  props: {
    task: { type: Object },
    project: { type: Number }
  },
  data() {
    return {
      contextMenuItems: TASK_CONTEXT_MENU,
      filterKey: "",
      loading: false,
      popupMessages: [],
      taskToDelete: {},
      // confirmModal: false,
      // confirmMsg: "",
      alertDialog: false,
      alertMsg:"",
      format: "D MMM YYYY",
      dueDate: null,
      ddate: null,
      // formattedDuedate: null,
      editTitle: false,
      taskDeleteConfirm: false,
      
    };
  },
  /*watch: {
    task(newValue){
      this.form = _.cloneDeep(newValue)
      this.ddate = this.$formatDate(newValue.dueDate)
    }
  },*/
  computed: {
    ...mapGetters({
      favTasks: "task/getFavTasks",
      teamMembers: "user/getTeamMembers",
    }),
    // isFavorite() {
    //   let fav = this.favTasks.some(t => t.task.id == this.task.id)
    //   if (fav) {
    //     return { variant: "orange", text: "Remove favorite", status: true }
    //   } else {
    //     return { variant: "gray5", text: "Add to favorites", status: false }
    //   }
    // },
    overdue() {
      let check = pastDue(this.task.dueDate)
      return check
    },
    form() {
      return _.cloneDeep(this.task)
    },

  },
  mounted(){
    // this.dueDate = new Date(this.task.dueDate).toISOString()
    this.ddate = this.task.dueDate ? this.$formatDate(this.task.dueDate) : null
    this.dueDate = this.$formatDate(this.task?.dueDate)
  },
  /*updated() {
    let ht = this.$refs.titleInput.scrollHeight
    this.$refs.titleInput.style.height = ht + 2 + 'px'
  },*/
  methods: {
    textAreaAdjust(event) {
      // console.log(event.target)
      let element = event.target
      element.style.height = "1px";
      element.style.height = (8 + element.scrollHeight) + "px";
    },
    makeEditable(){
      this.editTitle = true;
      this.$emit('open-sidebar', this.task)
      process.nextTick(() => {
        this.$refs["titleInput"].focus()
      });
    },
    openContextMenu() {
      let isFav = this.favTasks.some((f) => f.taskId == this.task.id)
      if (isFav) {
          this.contextMenuItems=this.contextMenuItems.map(item => item.label === "Add to Favorites" ? { ...item, label: "Remove favorite"} : item);
      }
           if(this.task.statusId==5){
        this.contextMenuItems=this.contextMenuItems.map(item => item.label === "Mark Complete" ? { ...item, label: "Completed"} : item);
        }
      else{
        this.contextMenuItems=this.contextMenuItems.map(item => item.label === "Completed" ? { ...item, label: "Mark Complete"} : item);
      }
    },

    showUserPicker(task) {
      this.$nuxt.$emit("user-picker", { event, task })
      this.$emit("user-picker", { event, task })
    },
    /*showDatePicker(task) {
      this.$nuxt.$emit("date-picker", { event, task })
      this.$emit("date-picker", { event, task })
    },*/

    parseDate(dateString, format) {
      // console.log(...arguments, "parseDate")
      return new Date(dateString);
    },
    formatDate(dateObj, format) {
      // console.log(...arguments, "formatDate")
      return this.$formatDate(dateObj);
    },

    updateDate(d, item, field, label) {

      let oldValue = item.dueDate
      let newDueDate = this.$dayjs(d).isValid() ? new Date(d) : null;

      // console.table({"newvalue": d, "newduedate ISO":newDueDate, "oldvalue":oldValue, "ddate":this.ddate})

      this.$store.dispatch("task/fetchHistory", item).then(() => {
        let oldlog = this.$oldLog("Due date")

          if (d == null) {
            this.$nuxt.$emit("change-duedate", { id: item.id, label: "Due date", field: "dueDate", value: null, oldlog: oldlog ? {id: oldlog.id, userId: oldlog.userId} : null })
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
              // this.form.dueDate = oldValue
              this.ddate = this.$formatDate(oldValue)
              return
            } else {
              this.$nuxt.$emit("change-duedate", { id: item.id, label: "Due date", field: "dueDate", value: newDueDate, oldlog: oldlog ? {id: oldlog.id, userId: oldlog.userId} : null })
              return
            }
          } else {
            this.$nuxt.$emit("change-duedate", { id: item.id, label: "Due date", field: "dueDate", value: newDueDate, oldlog: oldlog ? {id: oldlog.id, userId: oldlog.userId} : null })
          }
        
      })
      
    },

    openSidebar(task, scroll) {
      this.$nuxt.$emit("open-sidebar", { ...task, scrollId: scroll });
    },

    restoreField(){
      if (event.target.value == "") {
        event.target.value = this.form.title
        event.target.classList.remove("error")
      }
      this.editTitle = false
    },

    debounceUpdate: _.debounce(function(label, field, value, $event) {
      let historyText;

      if (label == "Due date" || label == "Start date") {
        historyText = this.$formatDate(taskData.value)
      }

      if (_.trim(value) == "") {
        $event.target.classList.add('error')
        console.warn(field + ' cannot be left blank')
      } else {
        $event.target.classList.remove('error')
        this.updateTask(label, field, value, historyText)
      }

    }, 1200),

    updateTask(label, field, value, historyText) {
      this.userPickerOpen = false
      const project = () => {
        if (this.task.project.length > 0) {
          return this.task.project[0].projectId
        } else if (this.project) {
          return this.project
        } else {
          return null
        }
      }

      let user
      if (field == "userId" && value != '') {
        user = this.teamMembers.filter(t => t.id == value)
      } else {
        user = null
      }

      this.$store.dispatch("task/updateTask", {
          id: this.task.id,
          data: {
            [field]: value
          },
          user,
          text: `changed ${label} to ${historyText ?? value}`
        })
        .then(res => {
          // this.$nuxt.$emit("update-key")
          // this.loading = false
          // this.$store.dispatch("task/setSingleTask", res.data)

        })
        .catch(e => console.warn(e))
    },

    addToFavorites(task) {
      let isFav = this.favTasks.some((f) => f.taskId == task.id)

      if (isFav) {
        this.$store.dispatch("task/removeFromFavorite", { id: task.id })
          .then(msg => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
            this.$emit("update-key")
          })
          .catch(e => {
            console.log(e)
          })
      } else {
        this.$store.dispatch("task/addToFavorite", { id: task.id })
          .then(msg => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
            this.$emit("update-key")
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    markComplete(task) {
      this.$store.dispatch('task/updateTaskStatus', task)
        .then((d) => {
          this.$nuxt.$emit("update-status-grid-task",task)
          // this.$nuxt.$emit("update-key")
          this.$store.dispatch("task/setSingleTask", d)
        }).catch(e => {
          console.log(e)
        })
    },
    
    deleteTask(task) {
      if (this.taskToDelete) {
        this.$store.dispatch("task/deleteTask", this.taskToDelete)
        .then(t => {
          if (t.statusCode == 200) {
            this.popupMessages.push({ text: t.message, variant: "primary-24" })
            this.$emit("update-key", t.message)
            // this.taskToDelete = {}
          } else {
            this.popupMessages.push({ text: t.message, variant: "primary-24" })
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
        // this.taskToDelete = {}
      }
      // this.taskToDelete = task
      // this.confirmMsg = "Are you sure "
      // this.confirmModal = true
    },
    activeVariant(item) {
      if (item.label.includes('Completed')) {
          return this.variant='success'
        }
        if (item.label=='Remove favorite') {
          return this.variant='primary-24'
        }
      if (item.label.includes('Complete')) {
        return this.task.statusId == 5 ? 'success' : 'gray5'
      }
      if (item.label.includes('Delete')) {
        return 'danger'
      }
      // if (item.label.includes('Favorites')) {
      //   let fata = this.favTasks.some(ft => ft.taskId == this.task.id)
      //   return fata ? 'orange' : 'gray5'
      // }
    },
    closeConfirm($event){
      // console.log(...arguments)
      this.taskDeleteConfirm = false
    },
    contextItemClick(item) {
      switch (item.event) {
        case 'done-task':
          this.markComplete(this.task)
          break;
        case 'fav-task':
          this.addToFavorites(this.task)
      
          break;
        case 'delete-task':
          // this.deleteTask(this.task)
          this.taskDeleteConfirm = true
          this.taskToDelete = this.task
          break;
        case 'copy-task':
          this.copyTaskLink(this.task)
          break;
        case 'gotoTeam':
          this.$nuxt.$emit('add-member-to-task')
          break;
        case 'gotoComment':
          this.openSidebar(this.task, 'task_conversation')
          break;
        case 'gotoSubtask':
          this.openSidebar(this.task, 'task_subtasks')
          break;
        case 'gotoFiles':
          this.openSidebar(this.task, 'task_files')
          break;
        default:
          this.alertDialog = true
          this.alertMsg = "no task assigned"
          break;
      }
    },

    copyTaskLink(task) {
        let url = window.location.host + `/tasks/${task.id}`;
        
        if (navigator.clipboard) { 
          navigator.clipboard.writeText(url);
        } else { 
          unsecuredCopyToClipboard(url);
        }
    }
  },
};

</script>
<style scoped lang="scss">
.box-shadow {
  box-shadow: 0 6px 30px -2px rgba(0,0,0,.38);
}
.task-grid {
  font-size: 14px;
  margin: 0 0 1rem;
  border: 1px solid var(--bib-gray4);
  border-radius: 6px;
  cursor: pointer;
  transition: all 200ms ease;

  &.bg-danger {
    background-color: var(--bib-danger);
    color: #fff;

    .user-name {
      color: #fff
    }
  }

  &.active {
    box-shadow: 0 0 0 2px $primary-sub1 inset;
  }
  &:hover {
    border-color: $primary-sub1;
  }

  .task-image {
    aspect-ratio: 16/9;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .editable-input-grid {
    font-size: $base-size;
    font-weight: normal;
    resize: initial;
    padding-block: 0.1rem;
    min-height: 1.8rem;
    height: auto;
    overflow: auto;
  }
  .editable-input-div {
    font-size: $base-size;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    display: -webkit-box;

  }

  .task-top,
  .task-bottom {
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
  }

  .task-mid {
    padding: 4px 8px;
  }

  .task-bottom {
    color: $gray5;
  }
  .date-input { flex-basis: 9rem; }

}

.user-name-blank,
.date-info-blank {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px dashed $gray4;
}

::v-deep {
  .vdpComponent {
    background: none transparent;
    border: 0 none;
    cursor: pointer;
    &__input {
      background: none transparent;
      border: 0 none; 
      margin: 0;
      min-height: 2rem;
      max-width: 9rem;
    }
    .vdpClearInput {
      width: 1.5rem;
    }
  }
  .left-datetime-picker {
    & > div.vdpPositionLeft {
      left: initial;
      right: -8px;
    }

  }
}

</style>
