<template>
  <client-only>
    <div id="page" class="project-id-wrapper ">
      <nav id="project-id-nav" class="d-flex align-center gap-025 py-05 px-025 "> 
        <skeleton-box v-if="skeleton" style="width: 12rem;"></skeleton-box>
        <template v-else>
          <button type="button" @click="$router.push('/projects')" class="d-flex cursor-pointer bg-white border-white px-025" style="padding-block: 0.2rem;">
            <bib-icon icon="arrowhead-left" :scale="1.6" variant="gray5"></bib-icon>
          </button>
          <span id="project-id-project-title" class="font-w-600 " style="font-size: 1.125rem;">{{projectTitle}}</span>
          <span :id="projectName+'-count'" class="text-secondary-sub1 " style="font-size: 1rem;">({{taskcount}})</span>
        </template>
        <div class="ml-auto d-flex gap-05 align-center position-relative" id="project-id-button-wraps">
          <team-avatar-list :team="team"></team-avatar-list>

          <div class="shape-circle bg-light bg-hover-gray2 width-2 height-2 d-flex cursor-pointer" id="project-id-menu-item1" @click="projectTeamModal = true" v-tooltip="'Team'">
            <bib-icon icon="user-group-solid" variant="gray5" class="m-auto"></bib-icon>
          </div>
          <div class="shape-circle bg-light bg-hover-gray2 width-2 height-2 d-flex cursor-pointer" id="project-id-menu-item2" @click="conversationModal = true" v-tooltip="'Conversations'">
            <bib-icon icon="comment-forum-solid" variant="gray5" class="m-auto"></bib-icon>
          </div>
          <div class="shape-circle bg-light bg-hover-gray2 width-2 height-2 d-flex cursor-pointer" id="project-id-menu-item3" @click="modalOpen('files', 'Files')" v-tooltip="'Files'">
            <bib-icon icon="file" variant="gray5" class="m-auto"></bib-icon>
          </div>
          <div class="shape-circle bg-light bg-hover-gray2 width-2 height-2 d-flex cursor-pointer" id="project-id-bookmark" @click="setFavorite" v-tooltip="'Add to Favorite'">
            <bib-spinner v-if="favLoading" :scale="2" ></bib-spinner>
            <bib-icon v-else class="m-auto" icon="bookmark-solid" :variant="isFavorite.variant"></bib-icon>
          </div>
          <div id="project-id-horizontal-dots-wrap" class="cursor-pointer bg-light bg-hover-gray2 shape-circle width-2 height-2 d-flex align-center justify-center">
            <bib-popup pop="horizontal-dots" id="project-id-horizontal-dots">
              <template v-slot:menu>
                <div class="list" id="project-id-list">
                  <span class="list__item" id="project-id-list-item1" @click="modalOpen('overview', 'Overview')">
                   <bib-icon icon="info" variant="gray5" class="mr-05"></bib-icon> View details
                  </span>
                  <span class="list__item" id="project-id-list-item2" @click="setFavorite">
                    <bib-icon icon="bookmark-solid" :variant="isFavorite.variant" class="mr-05"></bib-icon> {{isFavorite.text}}
                  </span>
                  <span class="list__item" id="project-id-list-item3" @click="projectTeamModal = true">
                    <bib-icon icon="user-group-solid" variant="gray5" class="mr-05" ></bib-icon> Team
                  </span>
                  <span class="list__item" id="project-id-list-item3" @click="conversationModal = true">
                    <bib-icon icon="comment-forum-solid" variant="gray5" class="mr-05"></bib-icon> Conversation
                  </span>
                  <span class="list__item" id="project-id-list-item3" @click="modalOpen('files', 'Files')">
                    <bib-icon icon="file" variant="gray5" class="mr-05"></bib-icon> Files
                  </span>
                  <span class="list__item" id="project-id-list-item3" @click="copyProjectLink">
                    <bib-icon icon="duplicate" variant="gray5" class="mr-05"></bib-icon> Copy Link
                  </span>
                  <!-- <span class="list__item" id="project-id-list-item5" @click="reportModal = !reportModal">
                    <bib-icon icon="warning" variant="gray5" class="mr-05"></bib-icon> Report
                  </span> -->
                  <hr id="project-id-hr2">
                  <span v-if="cdp" class="list__item list__item__danger" 
                      @mouseenter="deleteBtnHover = true"
                      @mouseleave="deleteBtnHover = false" 
                      id="project-id-list-item6" @click="projectDeleteConfirm = true">
                    <bib-icon icon="trash" :variant='deleteBtnHover ? `white` : `danger`' class="mr-05"></bib-icon> Delete 
                  </span>
                </div>
              </template>
            </bib-popup>
          </div>
        </div>
      </nav>

      <!-- Task View -->
      <!-- <div id="project-id-content" class="project-id-content bg-light position-relative h-100 ">
      </div> -->
      
      <task-view :sections="projectSections" :gridType="gridType"></task-view>

      <!-- project modals -->
      <bib-modal-wrapper v-if="projectModal" :title="projectModalTitle" size="xl" @close="projectModal = false">
        <template slot="content">
          <!-- <div class="overflow-y-auto " style="max-height: 500px"> -->
            <project-overview v-if="projectModalContent == 'overview'" @update-desc="projectDesc = $event" ></project-overview>
            <project-files v-if="projectModalContent == 'files'" :proj="project"></project-files>
          <!-- </div> -->
        </template>
      </bib-modal-wrapper>

      <!-- conversation modal -->
      <bib-modal-wrapper v-if="conversationModal" title="Conversation" size="xl" @close="conversationModal = false" >
        <template slot="content">
          <project-conversation :project="project"></project-conversation>
        </template>
        <template slot="footer">
          <div class="message-input-wrapper d-flex gap-1">
            <bib-avatar :src="user2.Photo" size="2rem" class="flex-shrink-0" ></bib-avatar>
            <message-input class="flex-grow-1" :value="value" :editingMessage="editMessage" @input="onFileInput" @submit="onsubmit"></message-input>
          </div>
        </template>
      </bib-modal-wrapper>

      <!-- project team -->
      <bib-modal-wrapper v-if="projectTeamModal" title="Team" size="lg" @close="projectTeamModal = false">
        <template slot="content">
          <div style="min-height: 12rem;">
          <project-team-modal :project="project"></project-team-modal>
          </div>
        </template>
      </bib-modal-wrapper>

      <!-- project delete confirm -->
      <bib-modal-wrapper v-if="projectDeleteConfirm" title="Delete project" @close="projectDeleteConfirm = false">
        <template slot="content">
          <p>Are you sure?</p>
          <loading :loading="loading"></loading>
        </template>
        <template slot="footer">
            <div v-show="!loading" class="justify-between gap-1">
              <bib-button label="Cancel" variant="secondary" pill @click="projectDeleteConfirm = false"></bib-button>
              <bib-button label="Delete" variant="primary-24" pill @click="deleteProject"></bib-button>
            </div>
        </template>
      </bib-modal-wrapper>

      <!-- report modal -->
      <bib-modal-wrapper v-if="reportModal" title="Report" size="sm" @close="reportModal = false">
        <template slot="content">
          <bib-input type="text" label="Subject" v-model.trim="reportSubj" placeholder="enter subject"></bib-input>
          <bib-input type="textarea" label="Message" v-model.trim="reportText" placeholder="enter text"></bib-input>
          <loading :loading="loading"></loading>
        </template>
        <template slot="footer">
          <div class="text-center d-flex justify-between">
            <bib-button label="Cancel" variant="light" pill v-on:click="reportModal = false"></bib-button>
            <bib-button label="Send" variant="primary-24" pill v-on:click="submitReport"></bib-button>
          </div>
        </template>
      </bib-modal-wrapper>
      <alert-dialog v-show="alertDialog" :message="alertMsg" @close="alertDialog = false"></alert-dialog>

      <!-- notification -->
      <bib-popup-notification-wrapper>
        <template #wrapper>
          <bib-popup-notification v-for="(msg, index) in popupMessages" :key="index" :message="msg.text" :variant="msg.variant" autohide="3500">
          </bib-popup-notification>
        </template>
      </bib-popup-notification-wrapper>
    </div>
  </client-only>
</template>

<script>
import { mapGetters } from 'vuex'
import { unsecuredCopyToClipboard } from '~/utils/copy-util.js'

export default {
  name: 'ProjectId',
  data() {
    return {
      projectModal: false,
      conversationModal: false,
      value: {
        files: []
      },
      projectId: null,
      editMessage: {},
      projectModalTitle: '',
      projectModalContent: '',
      projectTeamModal: false,      
      gridType: "list",
      renameModal: false,
      projectTitle: "",
      reportModal: false,
      reportText: "",
      reportSubj: "",
      loading: false,
      favLoading: false,
      popupMessages: [],
      alertDialog: false,
      alertMsg:"",
      cdp: false,
      project: null,
      deleteBtnHover: false,
      projectDesc: null,
      projectDeleteConfirm: false,
      user: null,
      skeleton: true,
    }
  },
  watch: {
    taskcount(newValue){
      return _.cloneDeep(newValue)
    },
    projectModal(newValue){
      // console.log(newValue, this.projectDesc?.value)
      if (this.projectDesc) {
        
        if (!newValue && this.projectModalContent == "overview") {
          
          let hText = this.projectDesc?.value.replace( /(<([^>]+)>)/ig, '');
          hText = _.truncate(hText, {'length': 30})
          // console.log(hText)
          let owner = this.teamMembers.find(tm => tm.id == this.project.userId)

          this.$store.dispatch("project/updateProject", {
            id: this.project?.id,
            user: owner,
            data: { "description": this.projectDesc.value },
            text: `changed ${this.projectDesc.label} - ${hText}`
          }).then(p => {
            this.$store.dispatch("project/fetchSingleProject", this.project.id )
          }).catch(e => console.warn(e))
        } 
      } 
    },
    $route: {
      handler(to, from){
        console.log(to.params)
      },
      immediate: true
    }
  },

  computed: {

    ...mapGetters({
        projects: 'project/getAllProjects',
        teamMembers: "user/getTeamMembers",
        team: "project/getProjectMembers",
        projectSections: 'section/getProjectSections',
        // projectTasks: "task/tasksForListView",
        // taskFields: "task/tableFields",
        favProjects: "project/getFavProjects",
        user2: "user/getUser2",
        filterViews :'task/getFilterView', 
        grid:"project/getGridType",
        taskcount:"section/getTaskCount"

    }),

    projectName: {
      get() {
        return this.project?.title
      },
      set(value) {
        this.projectTitle = value
      }
    },

    isFavorite() {
      let fav = this.favProjects.some(t => t.id == this.project?.id)
      if (fav) {
        return { variant: "primary", text: "Remove favorite", status: true }
      } else {
        return { variant: "gray5", text: "Add to favorites", status: false }
      }
    },

  },
  created() {
    
    this.$nuxt.$on("change-grid-type", (type) => {
      this.gridType = type;
      this.$store.commit('project/gridType',{gridType:this.gridType})
      localStorage.setItem('singlegrid', this.gridType)
    });

    this.$nuxt.$on("set-active-task", (task) => {
      this.activeTask = task;
    });

    this.$nuxt.$on("edit-message", (msg) => {
      this.editMessage = msg
    })

  },

  async asyncData({$axios, app, params, store}) {
    const token = app.$cookies.get(process.env.SSO_COOKIE_NAME)
    const filter = store.getters['task/getFilterView']
    const user = store.getters['user/getUser']
    try {

      const proj = await $axios.$get(`/project/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      store.dispatch('project/setProject', proj)
      
      return { project: proj.data, projectTitle: proj.data?.title, user: user }
      
    } catch(err) {
      return { project: null, projectTitle: null, user: null }
    }

  },

  async mounted() {
    if (process.client) {

      // console.log(this.project.companyId, this.user.subb)
      if (this.project) {

        if (this.project?.companyId != this.user.subb) {
          this.$router.push('/notfound')
          return
        } else {
          if (this.project?.isDeleted) {
            this.$router.push('/notfound')
            return
          }

          let ut = await this.$store.dispatch("project/fetchTeamMember", { projectId: this.project.id, userId: this.project?.userId ? this.project?.userId : null })

          let ptm = null
          ptm = ut.find(u => u.id == this.user.sub)

          if (ptm || this.user.subr == 'ADMIN') {
            // console.info('user has access!')
            this.skeleton = false
          } else {
            this.$router.push('/error/403')
            return
          }

          this.$store.dispatch("section/fetchProjectSections",{projectId: this.project.id})

          this.$store.dispatch("project/setSingleProject", {currentProject: this.project})
          this.projectTitle = this.project?.title;

          this.$store.commit("task/setExpandVisible", true)
          this.$store.commit('section/setGroupBy', "default")

          // this.canDeleteProject()
          if (this.project?.userId == this.user.sub || this.user.subr == 'ADMIN' ) {
            this.cdp = true
            return true;
          } else {
            this.cdp = false
            return false
          }
            
          // this.$store.dispatch("section/fetchProjectInitialSections", { projectId: this.$route.params.id, filter: 'all' })
          setTimeout(() => {
            if(localStorage.getItem('singlegrid')!=null){
              if(localStorage.getItem('singlegrid')=='grid'){
                this.gridType='grid'
              }
              if(localStorage.getItem('singlegrid')=='list')
              this.gridType='list'
            }
            else {
              this.gridType=this.grid
            }
          }, 200);
        }
      } else {
        this.$router.push('/notfound')
      }
    }
  },

  beforeDestroy(){
    // console.info("before destroy hook");
    this.project = {}
    this.$store.dispatch('project/setSingleProject', {})
  },

  methods: {

    modalOpen(content, title) {
      this.projectModal = true
      this.projectModalTitle = title
      this.projectModalContent = content
      this.projectDesc = null
    },

    setFavorite() {
      this.favLoading = true
      if (this.isFavorite.status) {
        this.$store.dispatch("project/removeFromFavorite", { id: this.$route.params.id })
          .then(msg => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
          })
          .catch(e => console.log(e))
          .then(() => this.favLoading = false)
      } else {
        this.$store.dispatch("project/addToFavorite", { id: this.$route.params.id })
          .then(msg => {
            this.popupMessages.push({ text: msg, variant: "primary-24" })
          })
          .catch(e => console.log(e))
          .then(() => this.favLoading = false)
      }
    },

    
    deleteProject() {
      this.loading = true
      this.$store.dispatch("project/deleteProject", this.project).then(p => {
        if (p.statusCode == 200) {
          this.popupMessages.push({ text: "Project deleted successfully", variant: "primary-24" })
          this.$store.dispatch('project/fetchFavProjects')
          this.$router.push('/projects')
        } else {
          this.popupMessages.push({ text: p.message, variant: "primary-24" });
          console.warn(p.message);
        }
      }).catch(e => {
        this.popupMessages.push({ text: e, variant: "danger" })
        console.log(e)
      }).then(() => {
        this.loading = false;
        this.projectDeleteConfirm = false
      });
    },

    canDeleteProject() {
      if (this.project.userId == JSON.parse(localStorage.getItem('user')).sub || JSON.parse(localStorage.getItem('user')).subr == 'ADMIN' ) {
        this.cdp = true
        return true;
      }
      this.cdp = false
      return false
    },

    onFileInput(payload) {
      this.value.files = payload.files
    },

    copyProjectLink() {
        let url = window.location.href;

        if (navigator.clipboard) { 
          navigator.clipboard.writeText(url);
        } else { 
          unsecuredCopyToClipboard(url);
        }
    },

    onsubmit(data) {
      if (this.editMessage?.id) {
        this.$store.dispatch("project/updateProjectComment", { projectId: this.project?.id, commentId: this.editMessage.id, comment: data.text })
        .then(res => {
          if (this.value.files.length > 0) {
            this.uploadFile(this.value.files, this.editMessage)
            this.value.files = []
          }
          this.$nuxt.$emit('refresh-list')
          this.editMessage = {}

        })
        .catch(e => console.log(e))
      } else {
        this.$store.dispatch("project/createProjectComment", { id: this.project?.id, comment: data.text })
          .then(res => {
            if (this.value.files.length > 0) {
              this.uploadFile(this.value.files, res.data)
              this.value.files = []
            }
            this.$nuxt.$emit('refresh-list')
          })
          .catch(e => console.log(e))
      }
    },
    async uploadFile(commentFiles, data){
      let formdata = new FormData()
      let filelist = []

      commentFiles.forEach(file => {
        formdata.append('files', file)
        filelist.push(file.name)
      })
      formdata.append('projectId', this.project?.id)
      formdata.append('projectCommentId', data.id)
      formdata.append('text', `uploaded file(s) "${filelist.join(", ")}" to comment`)

      const fi = await this.$axios.post("/file/upload", formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (fi.data.statusCode == 200) {
        this.value.files = []
        this.$nuxt.$emit("get-msg-files")
      }
    }

  }
}

</script>
<style lang="scss" scoped>
.project-id-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-id-content {

}

#project-id-nav {
  border-bottom: 1px solid var(--bib-light);
}

.shape-circle {
  .menu {
    margin-left: auto;
    margin-right: auto
  }
}

.team-avatar-list {
  position: relative;

  .avatar:hover {
    z-index: 11
  }

  .extra {
    margin-left: 0.75rem;
    color: $secondary;
  }
}

</style>
