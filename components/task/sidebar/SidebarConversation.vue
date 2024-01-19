<template>
  <client-only>
    <div class="px-105 py-05 " id="sc-container">
      <!-- <div class=" sub-title pb-025 " id="sc-heading-wrap">
        <p class="text-gray6 font-sm " id="sc-heading-conv">Conversation </p>
      </div> -->
      <div class="task-conversation w-100 " id="sc-task-team">
        <!-- <div class="message-wrapper py-025 position-relative" id="sc-message-wrapper"> -->
          <!-- <template v-if="showPlaceholder">
            <div class="placeholder my-05 d-flex align-center gap-05" id="sc-placeholder">
              <div class="left" id="sc-left">
                <div class="shape-circle width-2 height-2 animated-background" id="sc-shape-circle"></div>
              </div>
              <div class="right" id="sc-right">
                <div class="animated-background width-4 " id="sc-animated-bg-w4" style="height: 0.8rem;"></div>
                <div class="animated-background width-10 mt-025" id="sc-animated-bg-w10" style="height: 0.6rem;"></div>
              </div>
            </div>
          </template> -->
          <!-- <template v-else-if="sortedData.length > 0">
            <div v-for="(item, index) in sortedData" :key="index" :id="'sc-sortedData-'+index">
              <message v-if="item.comment" :msg="item" fieldkey="task" @delete-message="onDeleteMessage" @upload-file="uploadFileTrigger"></message>
              <task-history v-if="item.text && !item.isHidden" :history="item" ></task-history>
            </div>
          </template> -->

          <!-- <bib-tabs :tabs="bibTabs" :value="activeTab" @change="handleChange_Tabs" class="mb-05"></bib-tabs> -->
          <div class="mytabs align-center gap-1 mb-05">
            <button v-for="t in bibTabs" class="cursor-pointer px-0 py-05" :class="{'active': t.value == activeTab}" @click.stop="handleChange_Tabs(t.value)"><bib-icon v-if="t.value == activeTab" icon="collapse-fullscreen" :scale="0.8"></bib-icon> {{t.title}}</button>
          </div>
          
          <div style="min-height: 3rem;">
            <transition name="fade">
              <div v-if="activeTab == bibTabs[0].value" key="comments">
                <div v-if="comments.length < 1" class="font-sm text-gray6">
                  No comments yet
                </div>
                <message v-for="item in comments" :msg="item" :key="item.id" fieldkey="task" @delete-message="onDeleteMessage" @upload-file="uploadFileTrigger"></message>
                <template v-if="showPlaceholder">
                  <div class="placeholder my-05 d-flex align-center gap-05" id="sc-placeholder">
                    <div class="left" id="sc-left">
                      <div class="shape-circle width-2 height-2 animated-background" id="sc-shape-circle"></div>
                    </div>
                    <div class="right" id="sc-right">
                      <div class="animated-background width-4 " id="sc-animated-bg-w4" style="height: 0.8rem;"></div>
                      <div class="animated-background width-10 mt-025" id="sc-animated-bg-w10" style="height: 0.6rem;"></div>
                    </div>
                  </div>
                </template>
              </div>
              <div v-if="activeTab == bibTabs[1].value" key="history">
                <div v-for="item in history" :key="item.id">
                  <task-history v-if="item.text && !item.isHidden && !item.taskCommentId" :history="item" ></task-history>
                </div>
              </div>
            </transition>
          </div>
          
        <!-- </div> -->
      </div>
    </div>
  </client-only>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data: function() {
    return {
      value: {
        files: []
      },
      comments: [],
      history: [],
      showPlaceholder: false,
      // msgLoading: false,
      bibTabs: [
        {
          title: "Conversation",
          value: "conv",
        },
        {
          title: "Log",
          value: "log",
        },
      ],
      activeTab: "conv"
    };
  },
  props: {
    reloadComments: { type: Number, default: 0 },
    reloadHistory: { type: Number, default: 0 },
  },
  computed: {
    ...mapGetters({
      task: "task/getSelectedTask",
      taskMembers: "task/getTaskMembers",
      project: "project/getSingleProject"
    }),

    /*sortedData(){
      let s = [ ...this.history, ...this.comments]
      if(s.length > 0){
        return s.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
      } else {
        return []
      }
    },*/
  },
  watch: {
    task(newValue, oldValue) {
      if (newValue.id && newValue.id != oldValue.id) {
        this.fetchTaskComments()
        this.fetchHistory()
      } else {
        this.comments = []
        this.history = []
      }
    },
    reloadComments(newValue, oldValue){
      if (newValue != oldValue) {
        this.fetchTaskComments()
      }
    },
    reloadHistory(newValue, oldValue){
      if (newValue != oldValue) {
        this.fetchHistory()
      }
    },

  },

  async mounted() {
    await this.$nuxt.$on("refresh-history", () => {
      this.fetchHistory()
    })
  },
  methods: {
    handleChange_Tabs(tab) {
      this.activeTab = tab
    },
    async fetchTaskComments() {
      if (Object.keys(this.task).length == 0) {
        console.log('no task selected')
        this.comments = []
        return
      }
      this.showPlaceholder = true
      const comm = await this.$axios.get(`/task/${this.task.id}/comments`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
        }
      })


      if (comm.data.statusCode == 200) {
        this.comments = comm.data.data
      }
      this.showPlaceholder = false
    },

    async onDeleteMessage(payload) {
      const del = await this.$store.dispatch("task/deleteTaskComment", {...payload, text: "task comment deleted"});
      if (del.statusCode == 200) {
        this.fetchTaskComments()
      }
    },

    uploadFileTrigger(msg){
      this.uploadModal = true
      this.msg = msg
    },

    fetchHistory() {
      this.$store.dispatch("task/fetchHistory", this.task)
        .then(h => {
          setTimeout(() => {
            // console.log('history',h)
            this.history = h
          }, 200)
        })
        .catch(e => {
          console.error(e)
        })
    },

  },
};

</script>
<style lang="scss" scoped>
.mytabs { 
  button { border: 0 none; background: none transparent; color: $gray5;
    &.active {
      color: $dark; font-weight: 500;
    }
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
