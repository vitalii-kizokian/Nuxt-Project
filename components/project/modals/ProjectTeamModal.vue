<template>
  <div id="ptm-task-team-wrapper" class="task-group position-relative w-100">
    <!-- <div class="bg-light p-1 shape-rounded"> -->
    <!-- <label id="ptm-create-team-modal-heading" class="text-gray6 font-md">Invite people </label> -->
    <!-- <bib-button test_id="teamlist-dd1" dropdown1="add1" label="Type name or email" v-model="member" v-on:input-keydown="teamInputKeydown" class="mt-05 mb-05">
      <template v-slot:menu>
        <ul id="ptm-atm-fields" class="border-gray1" style="border-radius: 0 !important; border: 1px solid var(--bib-gray1);">
          <li :id="'ptm-atm-field-'+index" v-for="(tm, index) in filterTeam" :key="'atm-items'+index" v-on:click="teamItemClick(tm)">
            <bib-avatar :src="tm.avatar" size="1.5rem"></bib-avatar>
            <span :id="'ptm-atm-person-name'+index" class="ml-05"> {{tm.label}} <span class="ml-075">{{tm.email}}</span></span>
          </li>
        </ul>
      </template>
    </bib-button> -->
    <bib-select label="Invite people" test_id="po-owner-dd2"  :options="userOptions" v-model="owner" v-on:change="teamItemClick($event)"></bib-select>
    <div id="ptm-project-team-members" class="overflow-y-auto" style="max-height: 200px;">
      <template v-for="t in team">
        <email-chip :key="t.id" :email="t.email" :name="t.label" :avatar="t.avatar" class="mt-025" :close="true" v-on:remove-email="removeMember(t)"></email-chip>
      </template>
      <!-- team.length == 0 && projectMembers.length<2 -->
      <small v-show="showMsg&&!message" class="text-danger font-xs" id="ptm-team-length">Select at least 1 team member.</small>
      <p v-if="message" v-text="message" class="font-sm mt-025 text-danger" id="ptm-message"></p>
    </div>
  <!-- </div>  -->
  <div class="bg-light p-1 my-05 shape-rounded">
    <label class="text-gray6 font-md" id="ptm-team-label">Team</label>
    <div class="overflow-y-auto mt-1" style="max-height: 200px">
      <template v-if="projectMembers.length">
        <bib-table :key="'tt-' + key" :fields="tableFields" class="border-top-gray3 bg-white" :sections="this.teamMembers.filter(item=>this.projectMembers.some(value=>value.id===item.id)).filter(item1=>!this.newTeam.some(val=>val.id===item1.id))"  :hide-no-column="true" headless>
          <template #cell(name)="data">
            <div class="d-flex align-center gap-05" id="ptm-owner-text">
              <bib-avatar :src="data.value.avatar" class="mt-auto mb-auto" size="1.5rem"></bib-avatar>
              <strong class="text-dark px-030 font-sm" >{{ data.value.label }}</strong>
              <span class="text-black px-030 font-sm">{{ data.value.email }}</span>
            </div>
          </template>
          <template #cell_action="data">
            <div v-if="!data.value.isOwner" id="ptm-trash-solid" class="cursor-pointer shape-circle" v-on:click="deleteMember(data.value)">
              <bib-icon icon="trash-solid" variant="gray5"></bib-icon>
            </div>
          </template>
        </bib-table>
        <bib-table :key="'ttt-' + key" :fields="tableFields" class="border-top-gray3 bg-white" :sections="this.teamMembers.filter(item=>this.newTeam.some(value=>value.id===item.id))" :hide-no-column="true" headless>
          <template #cell(name)="data">
            <div class="d-flex align-center gap-05" id="ptm-owner-text">
              <bib-avatar :src="data.value.avatar" class="mt-auto mb-auto" size="1.5rem"></bib-avatar>
              <strong class="text-dark px-030 font-sm" >{{ data.value.label }}</strong>
              <span class="text-black px-030 font-sm">{{ data.value.email }}</span>
            </div>
          </template>
          <template #cell_action="data">
            <div v-if="!data.value.isOwner" id="ptm-trash-solid" class="cursor-pointer shape-circle" v-on:click="deleteMember(data.value)">
              <bib-icon icon="trash-solid" variant="gray5"></bib-icon>
            </div>
          </template>
        </bib-table>
      </template>
    </div>
    <template v-if="norecord">
      <span id="ptm-projects-0" class="text-secondary font-md">
         No records found
      </span>
    </template>
    </div>
    <div v-show="team.length > 0" class="pt-05 justify-end" id="ptm-addIteamMember">
      <bib-button label="Add" variant="primary-24" pill @click="addTeamMember"></bib-button>
    </div>
    <loading :loading="loading"></loading>
  </div>
</template>

<script>
import { PROJECT_TEAM_FIELDS } from "~/config/constants";
import { mapGetters } from 'vuex';

export default {
  props: {
    project: { type: Object },
  },
  data: function() {
    return {
      member: "",
      team: [],
      newTeam:[],//updated by @wen 5.25
      filterKey: "",
      message: "",
      tableFields: PROJECT_TEAM_FIELDS,
      flag: false,
      key: 0,
      loading: false,
      norecord: false,
      showMsg: false,
      owner: null,
    };
  },

  watch: {
    projectMembers() {
      if (this.projectMembers.length == 0) {
        this.loading = false
        this.norecord = true
      } else {
        this.norecord = false
        this.loading = false
      }
    }
  },

  computed: {
    ...mapGetters({
      // project: "project/getSingleProject",
      projectMembers: 'project/getProjectMembers',
      teamMembers: "user/getTeamMembers",
      userOptions: "user/getUsersList",
    }),
    filterTeam() {
      let regex = new RegExp(this.filterKey, 'g\i')
      return this.teamMembers.filter((u) => {
        if (regex.test(u.label) || regex.test(u.email)) {
          return u
        }
      })
    },
  },

  mounted() {
    this.loading = true
    // console.log(this.project)
    this.$store.dispatch('project/fetchTeamMember', { projectId: this.$decodeFromHex(this.$route.params?.id) || this.project?.id})
    // console.log("sdsd",this.projectMembers)
  },

  created() {
    this.$root.$on('update-key', ($event) => {
      this.$store.dispatch('project/fetchTeamMember', { projectId: this.$decodeFromHex(this.$route.params?.id) || this.project?.id }).then(() => {
        this.key += $event
      })
    })
  },
  methods: {
    teamInputKeydown($event) {
      this.filterKey = $event
    },
    teamItemClick(tm) {
      let existing = this.projectMembers.filter(ex => ex.id == tm)
      if (existing.length == 0) {
        this.message = ""
        let m = this.teamMembers.filter(t => t.id == tm)
        if (this.team.some(el => el.id == m[0].id)) {
          return false
        }
        this.team.push(m[0])
        this.filterKey = ""
        this.showMsg=false
      } else {
        this.message = "User already exists"
      }
    },
    removeMember(tm) {
      let rm = this.team.map(t => t.id == tm.id)
      // console.log(rm.indexOf(true))
      this.team.splice(rm.indexOf(true), 1)
      if(this.team==0) {
        this.showMsg=true
      }
      if(this.owner) {
          this.owner=null
        }
    },
    addTeamMember() {
      this.loading = true
   
      if (this.team.length == 0) {
        this.loading = false
        return false
      } else {
        this.team.map((index)=>{
          let newObj = {id:index.id, name:index.label}
          this.newTeam.push(newObj)
        })
        if(this.owner) {
          this.owner=null
        }
        // console.log(this.project.id, this.newTeam)
        this.$store.dispatch('project/addMember', { projectId: this.project?.id, team: this.team }).then(() => {
          this.loading = false;
          this.message = ""
          this.team = []
          this.filterKey = ""
        }).catch((err) => {
          this.loading = false;
          this.message = ""
          this.team = []
          console.warn(err)
        })
      }
    },
    async deleteMember(member) {
      this.loading = true
      this.newTeam = this.newTeam.filter((item)=>item.id!==member.id);
      // let confirmDelete = window.confirm("Are you sure want to delete " + member.name + "!")
      // if (confirmDelete) {
        await this.$store.dispatch("project/deleteMember", { projectId: this.$decodeFromHex(this.$route.params?.id) || this.project?.id, member: member })
          .then((res) => {
            this.key += 1
          })
          .catch(e => console.warn(e))
        this.loading = false
      // }
    },
  }
};

</script>
<style scoped lang="scss">
  .table { margin-top: 0.5rem; }
</style>
