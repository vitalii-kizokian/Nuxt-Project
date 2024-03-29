
export const state = () => ({
  projects: [],
  selectedProject: {},
  favProjects: [],
  projectMembers: [],
  projectComments: [],
  singleProjComment: {},
  projectHistory: [],
  initialData:[],
  gridType:"list",
  collapseStatus:"true",
  groupByValue:"default",
  taskCount:0

});

export const getters = {
  getTaskCount (state) {
    return state.taskCount
  },
  getGroupBy (state) {
    return state.groupByValue 
  },
  // get projects
  getAllProjects(state) {
    return state.projects;
  },

  // get single project detail
  getSingleProject(state) {
    return state.selectedProject;
  },

  // get project comments
  getProjectComments(state) {
    return state.projectComments;
  },

  getProjectMembers(state) {
    return state.projectMembers;
  },

  // get favorite projects
  getFavProjects(state) {
    let fav = []
    state.favProjects.map(f => {
      fav.push({ label: f.projects.title, icon: "briefcase-solid", id: f.projects.id, selected: false })
    })
    return fav
  },

  getFavoriteProjects(state) {
    return state.favProjects;
  },

  getProjectHistory(state) {
    return state.projectHistory;
  },
  getGridType(state){

    return state.gridType
  },
  //get collapse status in the  menu
  getCollapseStatus(state) {
    return state.collapseStatus
  }
};

export const mutations = {
  setAddTaskCount (state, payload) {
    state.taskCount ++
  },
  setDeleteTaskCount (state, payload) {
    state.taskCount--
  },
  setTaskCount ( state, payload) {
    if(payload[0]?.tasks){
      state.taskCount= payload.reduce((acc, td) => acc + td.tasks?.length, 0)
    }
    else {
      state.taskCount=payload.length

    }
    // if (state.groupByValue == "") {
    // } else {
    //   state.taskCount= payload.reduce((acc, td) => acc + td.tasks?.length, 0)
    // }
  },
  setGroupBy(state,payload) {
    state.groupByValue=payload
  },
  setCollapseStatus (state,payload) {
    state.collapseStatus=payload
  },
  gridType(state,payload){
    state.gridType=payload.gridType
  },
  // To fetch all projects
  fetchProjects(state, payload) {
    state.projects = payload;
    
  },
  //to get initial projects
  fetchInitialProjects (state,payload) {
    if(payload) {
      payload.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return a.dueDate - b.dueDate;
        }
      });
    }
    state.initialData=payload
  },

  // To set a single project
  setSingleProject(state, { currentProject }) {
    state.selectedProject = currentProject;
  },

  // To create project
  createProject(state, payload) {
    state.projects.push(payload)
  },

  // to set project on project single page.
  setProject(state, payload) {
    state.selectedProject = payload;
  },

  createProjectForGroup(state, payload) {
    let obj = [...state.projects];
    obj[0].tasks.push(payload);
    state.projects = obj;
  },

  createProjectComment(state, payload) {
    state.projectComments.push(payload)
  },

  fetchProjectComments(state, payload) {
    state.projectComments = payload;
  },

  fetchSingleProjectComment(state, payload) {
    state.singleProjComment = payload
  },

  setFavProjects(state, payload) {
    state.favProjects = payload
  },

  fetchTeamMember(state, payload) {
    state.projectMembers = payload;
  },

  addMember(state, payload) {
    state.projectMembers.push(...payload)
  },


  flatProjects(state, payload) {
    let arr = JSON.parse(JSON.stringify(state.projects));
    if(arr[0].tasks){
      let _arr = [];
    arr.forEach((ele) => {
      _arr = _arr.concat(ele.tasks);
    })
    arr = _arr;
    }
    
    state.projects = arr;
  },
  getFilterProjects(state,payload){
    let arr=[]
    arr=state.initialData
   if(payload.filter=="incomplete")
   {
     arr=arr.filter((item)=>item.statusId!==5)
     if(payload.groupBy!="default"){
       arr=this.$groupBy(arr,payload.groupBy)
     }  
   }

   if(payload.filter=="complete")
   {
     arr=arr.filter((item)=>item.statusId==5)
     if(payload.groupBy!="default"){
       arr=this.$groupBy(arr,payload.groupBy)
     }  
   }
   if(payload.filter=="all")
   {
     if(payload.groupBy!="default"){
       arr=this.$groupBy(arr,payload.groupBy)
     }  
   }

  state.projects=arr
  if (state.groupByValue == "default") {
    state.taskCount=arr.length
  } else {
    state.taskCount= arr.reduce((acc, td) => acc + td.tasks?.length, 0)
  }
  },
  groupProjects(state, payload) {
    let arr = JSON.parse(JSON.stringify(state.projects));
    if(arr[0].tasks){
      let _arr = [];
      arr.forEach((ele) => {
        _arr = _arr.concat(ele.tasks);
      });
      arr = _arr;
    }
    state.projects=this.$groupBy(arr,payload.key)
  },
  sortProjects(state, payload) {
    let arr = JSON.parse(JSON.stringify(state.projects));
    if (payload.key == 'name' && payload.order == 'asc') {
      
      if(arr[0].tasks){// group is true 
              arr.forEach((ele)=>{
            ele.tasks.sort((a,b)=>a.title.localeCompare(b.title))
            return ele
          })
      }
    else{
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }  
      state.projects = arr;
    }

    if (payload.key == 'name' && payload.order == 'desc') {
      if(arr[0].tasks){
      arr.forEach((ele)=>{
        ele.tasks.sort((a,b)=>b.title.localeCompare(a.title))
        return ele
      })
    }
    else {
      arr.sort((a, b) => b.title.localeCompare(a.title));

    }
      state.projects = arr;
    }

    // Sort By Project Owner Name
    if (payload.key == 'owner' && payload.order == 'asc') {
      if(arr[0].tasks){
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.userId!==null&&item.userId!==undefined) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.userId && b.userId) {
              return a.user.firstName.localeCompare(b.user.firstName)
            }
          });
          ele.tasks=newArr
          return ele
        })
        state.projects = arr;
      // arr.forEach((ele)=>{
      //   ele.tasks.sort((a,b)=>a.user.firstName.localeCompare(b.user.firstName))
      //   return ele
      // })
    }
    else {
      // arr.sort((a, b) => a.user.firstName.localeCompare(b.user.firstName));
      let newArr = []

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].userId!==null&&arr[i].userId!==undefined) {
          newArr.unshift(arr[i])
        } else {
          newArr.push(arr[i])
          
        }
      }
      
      newArr.sort((a, b) => {
        if (a.userId && b.userId) {
          return a.user.firstName.localeCompare(b.user.firstName)
        }
      });
      
      state.projects = newArr;
    }
      // state.projects = arr;
    }

    if (payload.key == 'owner' && payload.order == 'desc') {
      if(arr[0].tasks){
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.userId!==null&&item.userId!==undefined) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.userId && b.userId) {
              return b.user.firstName.localeCompare(a.user.firstName)
            }
          });
          ele.tasks=newArr
          return ele
        })
        state.projects = arr;
      // arr.forEach((ele)=>{
      //   ele.tasks.sort((a,b)=>b.user.firstName.localeCompare(a.user.firstName))
      //   return ele
      // })
    }else {
      
      let newArr = []

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].userId!==null&&arr[i].userId!==undefined) {
          newArr.unshift(arr[i])
        } else {
          newArr.push(arr[i])
          
        }
      }
      
      newArr.sort((a, b) => {
        if (a.userId && b.userId) {
          return b.user.firstName.localeCompare(a.user.firstName)
        }
      });
      
      state.projects = newArr;

      // arr.sort((a, b) => b.user.firstName.localeCompare(a.user.firstName));
    }
    
    }

    // Sort By Status
    if (payload.key == 'status' && payload.order == 'asc') {
      if(arr[0].tasks){
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.statusId) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.statusId && b.statusId) {
              return a.status.text.localeCompare(b.status.text)
            }
          });
          ele.tasks=newArr
          return ele
        })
     
      state.projects=arr
      }
      else {

      let newArr = []

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].statusId) {
          newArr.unshift(arr[i])
        } else {
          newArr.push(arr[i])
          
        }
      }
      
      newArr.sort((a, b) => {
        if (a.statusId && b.statusId) {
          return a.status.text.localeCompare(b.status.text)
        }
      });
      
      state.projects = newArr;

    }
  }
    if (payload.key == 'status' && payload.order == 'desc') {
      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.statusId) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.statusId && b.statusId) {
              return b.status.text.localeCompare(a.status.text)
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
              let newArr = []

              for (let i = 0; i < arr.length; i++) {
                if (arr[i].statusId) {
                  newArr.unshift(arr[i])
                } else {
                  newArr.push(arr[i])
                }
              }

              newArr.sort((a, b) => {
                if (a.statusId && b.statusId) {
                  return b.status.text.localeCompare(a.status.text)
                }
              });
              state.projects = newArr;

       }
  }
    // Sort By Start Date
    if (payload.key == 'startDate' && payload.order == 'asc') {
      if(arr[0].tasks)
      {

        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.startDate) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.startDate && b.startDate) {
              return new Date(a.startDate) - new Date(b.startDate)
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
          let newArr = []

          for (let i = 0; i < arr.length; i++) {
            if (arr[i].startDate) {
              newArr.unshift(arr[i])
            } else {
              newArr.push(arr[i])
            }
          }
    
          newArr.sort((a, b) => {
            if (a.startDate && b.startDate) {
              return new Date(a.startDate) - new Date(b.startDate)
            }
          });
          state.projects = newArr;

       }

    }

    if (payload.key == 'startDate' && payload.order == 'desc') {
      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.startDate) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.startDate && b.startDate) {
              return new Date(b.startDate) - new Date(a.startDate)
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
          let newArr = []

          for (let i = 0; i < arr.length; i++) {
            if (arr[i].startDate) {
              newArr.unshift(arr[i])
            } else {
              newArr.push(arr[i])
            }
          }
    
          newArr.sort((a, b) => {
            if (a.startDate && b.startDate) {
              return new Date(b.startDate) - new Date(a.startDate)
            }
          });
          state.projects = newArr;

       }

    }

    // Sort By Due Date
    if (payload.key == 'dueDate' && payload.order == 'asc') {
      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.dueDate) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.dueDate && b.dueDate) {
              return new Date(a.dueDate) - new Date(b.dueDate)
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
          let newArr = []

          for (let i = 0; i < arr.length; i++) {
            if (arr[i].dueDate) {
              newArr.unshift(arr[i])
            } else {
              newArr.push(arr[i])
            }
          }
    
          newArr.sort((a, b) => {
            if (a.dueDate && b.dueDate) {
              return new Date(a.dueDate) - new Date(b.dueDate)
            }
          });
          state.projects = newArr;

       }
      
    }

    if (payload.key == 'dueDate' && payload.order == 'desc') {
      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.dueDate) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.dueDate && b.dueDate) {
              return new Date(b.dueDate) - new Date(a.dueDate)
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
          let newArr = []

          for (let i = 0; i < arr.length; i++) {
            if (arr[i].dueDate) {
              newArr.unshift(arr[i])
            } else {
              newArr.push(arr[i])
            }
          }
    
          newArr.sort((a, b) => {
            if (a.dueDate && b.dueDate) {
              return new Date(b.dueDate) - new Date(a.dueDate)
            }
          });
          state.projects = newArr;

       }
      
    }

    // Sort By Priority
    if (payload.key == 'priority' && payload.order == 'asc') {

      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.priorityId) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.priorityId && b.priorityId) {
              return a.priority.id - b.priority.id;
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
            let newArr = []

            for (let i = 0; i < arr.length; i++) {
              if (arr[i].priorityId) {
                newArr.unshift(arr[i])
              } else {
                newArr.push(arr[i])
              }
            }
      
            newArr.sort((a, b) => {
              if (a.priorityId && b.priorityId) {
                return a.priority.id - b.priority.id;
              }
            });
            state.projects = newArr;

       }

      
     
    }

    if (payload.key == 'priority' && payload.order == 'desc') {
      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.priorityId) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.priorityId && b.priorityId) {
              return b.priority.id - a.priority.id;
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
            let newArr = []

            for (let i = 0; i < arr.length; i++) {
              if (arr[i].priorityId) {
                newArr.unshift(arr[i])
              } else {
                newArr.push(arr[i])
              }
            }
      
            newArr.sort((a, b) => {
              if (a.priorityId && b.priorityId) {
                return b.priority.id - a.priority.id
              }
            });
            state.projects = newArr;

       }
     
    }

    // Sort By Department
    if (payload.key == 'department' && payload.order == 'asc') {
      let arr = JSON.parse(JSON.stringify(state.projects))

      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.departmentId) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.departmentId && b.departmentId) {
              return a.department.title.localeCompare(b.department.title)
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
        let newArr = []

        for (let i = 0; i < arr.length; i++) {
          if (arr[i].departmentId) {
            newArr.unshift(arr[i])
          } else {
            newArr.push(arr[i])
          }
        }
  
        newArr.sort((a, b) => {
          if (a.departmentId && b.departmentId) {
            return a.department.title.localeCompare(b.department.title);
          }
        });
        state.projects = newArr;

       }
      
    }

    if (payload.key == 'department' && payload.order == 'desc') {
      let arr = JSON.parse(JSON.stringify(state.projects))
      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.departmentId) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          newArr.sort((a,b)=>{
            if (a.departmentId && b.departmentId) {
              return b.department.title.localeCompare(a.department.title)
            }
          });
          ele.tasks=newArr
          return ele
        })
     
        state.projects=arr
      }
      else 
      {
        let newArr = []

        for (let i = 0; i < arr.length; i++) {
          if (arr[i].departmentId) {
            newArr.unshift(arr[i])
          } else {
            newArr.push(arr[i])
          }
        }
  
        newArr.sort((a, b) => {
          if (a.departmentId && b.departmentId) {
            return b.department.title.localeCompare(a.department.title)
          }
        });
        state.projects = newArr;

       }
      
  
    }

  },

  setProjectHistory(state, payload) {
    state.projectHistory = payload
  }

};

export const actions = {

  // for dispatch fetching projects
  async fetchProjects(ctx, payload) {
    // console.log(JSON.parse(window.localStorage.getItem('user')).subb)
    const res = await this.$axios.$get(`/project/company/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Filter': payload ? payload.filter : 'all'
      }
    });
    ctx.commit('fetchProjects', res.data);
    ctx.commit('setTaskCount',res.data)
    return res.data;
  },
  async fetchInitialProjects(ctx, payload) {
    // console.log(JSON.parse(window.localStorage.getItem('user')).subb)
    const res = await this.$axios.$get(`/project/company/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Filter': payload ? payload : 'all'
      }
    });
    ctx.commit('fetchInitialProjects', res.data);
    return res.data;
  },
  async fetchSingleProject(ctx, payload) {
    const proj = await this.$axios.$get(`/project/${payload}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    if (proj.statusCode == 200) {
      ctx.commit('setSingleProject', {currentProject: proj.data});
    }
    return proj
  },

  // for dispatching setting single project object
  setSingleProject(ctx, payload) {
    ctx.commit('setSingleProject', {currentProject: payload})
  },

  // create project 
  async createProject(ctx, payload) {
    const res = await this.$axios.$post('/project', {
      user: payload.user || null,
      userId: payload.userId || null,
      title: payload.title,
      statusId: payload.statusId||null,
      status:payload.status||null,
      departmentId: payload.departmentId || null,
      department: payload.department || null,
      description: null,
      startDate: null,
      dueDate: null,
      priority: payload.priority||null,
      priorityId: payload.priorityId||null,
      budget: null,
      text: `created new project "${payload.title}"`,
    }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.statusCode == 200) {
      // if (payload.groupBy != undefined && payload.groupBy != "") {
      //   ctx.commit("createProjectForGroup", res.data);
      //   ctx.commit("groupProjects", { key: payload.groupBy});
      // } 
      // ctx.commit("createProject", res.data);
      return res;
    } else {
      return res
    }
  },

  async updateProject(ctx, payload) {
    let res = await this.$axios.$put("/project", {
      id: payload.id,
      user: payload.user,
      data: payload.data,
      text: payload.text,
    }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
    
    if (res.statusCode == 200) {  
      ctx.commit("setSingleProject", {
        currentProject: res.data,
      });
    }

    return res
  },

  async deleteProject(ctx, payload) {
    const res = await this.$axios.$delete("/project", {
      headers: { "Authorization": `Bearer ${localStorage.getItem('accessToken')}` },
      data: { id: payload.id, project: payload, text: `project "${payload.title}" deleted` }
    })
    return res

  },

  async fetchFavProjects(ctx) {
    try {
      const fav = await this.$axios.$get("/project/user/favorites", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (fav.statusCode == 200) {
        ctx.commit("setFavProjects", fav.data)
      } else {
        ctx.commit("setFavProjects", [])
      }
      return fav
    } catch (e) {
      console.log(e);
    }
  },

  async fetchTeamMember(ctx, payload) {

    let tm = await this.$axios.get(`/project/${payload.projectId}/members`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
    // console.log(tm.data)
    if(tm.data.statusCode == 200) {
      let team = tm.data.data.members;
      let data = team.map((el) => {
        if(ctx.state.selectedProject) {
          if (ctx.state.selectedProject.userId == el.user.id) {
            el.isOwner = true
          } else {
            el.isOwner = false
          }
        } else {
          if (payload.userId == el.user.id) {
            el.isOwner = true
          } else {
            el.isOwner = false
          }
        }

        return { id: el.user.id, name: el.user.firstName + " " + el.user.lastName, isOwner: el.isOwner };
      });
      ctx.commit('fetchTeamMember', data)
      return data
    }
    else {
      console.warn(tm);
    }
  },

  async addMember(ctx, payload) {

    let data;
    if (ctx.getters.getProjectMembers.length < 1) {
      data = payload.team;
    } else {
      data = payload.team.filter((el1) => {
        if (ctx.getters.getProjectMembers.some((el2) => el2.id != el1.id)) {
          return el1;
        }
      })
    }
    let nameText = []
    let names = data.map(n => {
      nameText.push(`${n.firstName} ${n.lastName}`)
      return { id: n.id, name: `${n.firstName} ${n.lastName}`, isOwner: false };
    });

    const res = await this.$axios.post("/project/add-member", {
      projectId: payload.projectId,
      team: data,
      text: `${nameText.join(', ')} added to project`
    }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })

    if (res.data.statusCode == 200) {
      ctx.commit('addMember', names);
    }

  },
  groupProjects(ctx,payload){
    ctx.commit('groupProjects', payload)

},
  sortProjects(ctx, payload) {
    ctx.commit('sortProjects', payload)
  },

  async deleteMember(ctx, payload) {
    try {
      let m = await this.$axios.delete("/project/remove-member", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          "projectid": payload.projectId,
          "memberid": payload.member.id,
          "text": `${payload.member.name} removed from project`
        }
      })
      if (m.data.statusCode == 200) {
        ctx.dispatch("fetchTeamMember", { projectId: payload.projectId })
        return m.data.message
      } else {
        return m.data.message
      }
    } catch (e) {
      console.log(e);
    }
  },

  async addToFavorite(ctx, payload) {

    try {
      let fav = await this.$axios.post(`/project/${payload.id}/favorite`, {}, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
        }
      })

      if (fav.data.statusCode == 200) {
        // console.log(fav.data)
        ctx.dispatch("fetchFavProjects")
        return fav.data.message
      } else {
        return fav.data.message
      }

    } catch (e) {
      console.log(e);
    }
  },

  async removeFromFavorite(ctx, payload) {
    try {
      let fav = await this.$axios.delete(`/project/${payload.id}/favorite`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
        }
      })

      if (fav.data.statusCode == 200) {
        // console.log(fav.data)
        ctx.dispatch("fetchFavProjects")
        return fav.data.message
      } else {
        return fav.data.message
      }
    } catch (e) {
      console.log(e);
    }
  },

  async fetchProjectComments(ctx, payload) {
    try {
      let res = await this.$axios.get(`/project/${payload.id}/comments`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
        }
      })

      if (res.data.statusCode == 200) {
        ctx.commit("fetchProjectComments", res.data.data)
      }
      return res.data;
    } catch (e) {
      console.log(e);
    }
  },

  async createProjectComment(ctx, payload) {
    try {
      let trimComment = _.truncate(payload.comment.slice(3, -4), { length: 128 })
      const res = await this.$axios.$post(`/project/${payload.id}/comments`, {
        comment: payload.comment,
        text: `new comment ${trimComment}`,
        isHidden: false,
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.statusCode == 200) {
        ctx.commit('createProjectComment', res.data);
        return res
      } else {
        return res
      }
    } catch (e) {
      console.log(e)
    }
  },

  async updateProjectComment(ctx, payload) {

    try {
      let trimComment = _.truncate(payload.comment.slice(3, -4), { length: 128 })
      const res = await this.$axios.$put(`/project/${payload.projectId}/comments/${payload.commentId}`, {
        comment: payload.comment,
        text: `updated comment ${trimComment}`,
        isHidden: true,
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.statusCode == 200) {
        ctx.dispatch("fetchProjectComments", { id: payload.projectId })
        return res
      } else {
        return res
      }

    } catch (e) {
      console.log(e)
    }
  },

  async deleteProjectComment(ctx, payload) {

    try {
      const res = await this.$axios.$delete(`/project/${payload.projectId}/comments/${payload.commentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'text': "deleted comment",
          'isHidden': true,
          "userid": payload.userId
        }
      });
      if (res.statusCode == 200) {
        ctx.dispatch("fetchProjectComments", { id: payload.projectId })
        return res
      } else {
        return res
      }

    } catch (e) {
      console.log(e)
    }
  },

  async fetchSingleProjectDetail(ctx, payload) {

    try {
      const res = await this.$axios.$get(`/project/${payload.projectId}/comments/${payload.commentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.statusCode == 200) {
        ctx.dispatch("fetchSingleProjectDetail", res.data)
        return res
      } else {
        return res
      }

    } catch (e) {
      console.log(e)
    }
  },

  async fetchHistory(ctx, payload) {
    try {
      const hist = await this.$axios.$get("/history/all", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'obj': JSON.stringify({ "projectId": payload.id })
        }
      })

      if (hist.statusCode == 200) {
        ctx.commit("setProjectHistory", hist.data)
      }
      return hist.data
    } catch (e) {
      console.log(e);
    }
  },

  setProject(ctx, payload) {
    ctx.commit("setProject", payload);
  },

  setProjects(ctx, payload) {
    ctx.commit('fetchProjects', payload)
    ctx.commit('setTaskCount',payload)
  },

  async addCommentReaction(ctx, payload){
    try {
      const res = await this.$axios.post(`/project/${payload.projectCommentId}/reaction`, {
        reaction: payload.reaction,
        projectId: payload.projectId,
        text: payload.text
      }, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("accessToken") }
      })
      return res.data
    } catch(e) {
      console.warn(e);
    }
  },

  async fetchCommentReactions(ctx, payload){
    try {
      const res = await this.$axios.get(`/project/${payload.id}/reactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'obj': JSON.stringify({ "projectId": payload.id })
        }
      })
      // console.log(res.data)
      if (res.data.statusCode == 200) {
        return res.data.data
      }
    } catch(e) {
      console.log(e);
      return e
    }
  },
  async deleteCommentReaction(ctx, payload){
    try {
      const del = await this.$axios.delete(`project/${payload.projectCommentId}/reaction`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("accessToken") },
        data: { reactionId: payload.reactionId, userId: payload.userId },
      })
      return del.data
    } catch(e) {
      console.log(e);
    }
  }

}
