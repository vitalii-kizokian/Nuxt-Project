export const state = () => ({
  user: null,
  user2: null,
  teamMembers: [],
  appMembers: [],
  userTasks: [],
  sideBarUser:[],
  initialData:[],
  userInfo:[],
  isAdmin:false,
  groupByValue:"default",
  taskCount:0,
  usersList: [],
});

export const getters = {
  getTaskCount (state) {
    return state.taskCount
  },
  getUser(state) {
    return state.user;
  },

  getGroupBy (state) {
    return state.groupByValue 
  },
  getUser2(state) {
    return state.user2;
  },

  getTeamMembers(state) {
    let members = []
    state.teamMembers.map(t => {
      members.push({ label: t.FirstName + ' ' + t.LastName, firstName: t.FirstName, lastName: t.LastName, email: t.Email, icon: "user", id: t.Id, status: t.Status, role: t.Role, avatar: t.Photo, selected: false })
    })
    return members
  },

  getAppMembers(state) {
    let members=[]
    state.appMembers.map(t => {
      members.push({ label: t.FirstName + ' ' + t.LastName, firstName: t.FirstName, lastName: t.LastName, email: t.Email, icon: "user", id: t.Id, status: t.Status, role: t.Role, avatar: t.Photo, selected: false, completeTask: t.completeTask, taskCount:t.taskCount })
    })
    return members
  },

  getUserTasks(state) {
    return state.userTasks;
  },
  getSideBarUser(state){
    return state.sideBarUser
  },
  getInitialUserTasks(state){
    return state.initialData
  },
  getUserInfo(state) {
    return state.userInfo
  },
  getIsAdmin(state) {
    return state.isAdmin
  },
  getUsersList(state){
    return state.usersList
  }

};

export const mutations = {
  setTeams (state, payload) {
    state.teamMems = payload
  },
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
  },
  setGroupBy(state,payload) {
    state.groupByValue=payload
  },
  setIsAdmin(state,payload) {
    // console.log("store",payload)
    state.isAdmin=payload

  },
  setUserForTask(state,payload) {
    state.userInfo=payload
  },
  
  setFetchUserTasks(state,payload) {
      let arr=[]
      arr=payload.data
    if(payload.filter=="incomplete")
    {
      arr=arr.filter((item)=>item.statusId!==5)
      if(payload.key!="default"){
        arr=this.$groupBy(arr,payload.key)
      }  
    }

    if(payload.filter=="complete")
    {
      arr=arr.filter((item)=>item.statusId==5)
      if(payload.key!="default"){
        arr=this.$groupBy(arr,payload.key)
      }  
    }
    if(payload.filter=="all")
    {
      if(payload.key!="default"){
        arr=this.$groupBy(arr,payload.key)
      }  
    }
    state.userTasks=arr

    if(payload.key=="default") {
      state.taskCount= arr?arr.length:0
      
    }
    else {
      if(arr.length>0){
        state.taskCount=arr.reduce((acc, td) => acc + td.tasks.length, 0)
      }
      else {
        state.taskCount=0
      }
    }
  },
  flatTasks(state, payload) {
    let arr = JSON.parse(JSON.stringify(state.userTasks));
    if(arr[0]?.tasks){
      let _arr = [];
      arr.forEach((ele) => {
        _arr = _arr.concat(ele.tasks);
      })
      arr = _arr;
    }
    arr.sort((a, b) => {
      if (a.priorityId && b.priorityId) {
        return a.priorityId - b.priorityId;
      }
    });
    state.userTasks = arr;
  },
  getFilterUserTasks(state,payload){
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

      state.userTasks=arr
  },
  sortPeople(state, payload) {
    const arr = state.appMembers.map((member) => {
      const found = payload.data.find((item) => item.userId === member.Id);
      if (found) {
        return {
          ...member,
          completeTask: found.complete,
          taskCount: found.taskCount-found.complete,
        };
      } else {
        return {
          ...member,
          completeTask: 0,
          taskCount: 0,
        };
      }
    });
    if (payload.sort === "Most_Tasks_Todo") {
      arr.sort((a, b) => {
        if (b.taskCount === a.taskCount && b.completeTask === a.completeTask) {
          if (a.FirstName && b.FirstName) {
            return a.FirstName.charAt(0).toUpperCase().localeCompare(b.FirstName.charAt(0).toUpperCase());
          } else if (!a.FirstName && b.FirstName) {
            return -1;
          } else if (a.FirstName && !b.FirstName) {
            return 1;
          } else {
            return 0;
          }
        } else if (b.taskCount === a.taskCount) {
          return b.completeTask - a.completeTask;
        } else {
          return b.taskCount - a.taskCount;
        }
      });
    }
    if (payload.sort === "Least_Tasks_Todo") {
      // arr.sort((a, b) => a.taskCount - b.taskCount);
      arr.sort((a, b) => {
        if (b.taskCount === a.taskCount && b.completeTask === a.completeTask) {
          if (a.FirstName && b.FirstName) {
            return b.FirstName.charAt(0).toUpperCase().localeCompare(a.FirstName.charAt(0).toUpperCase());
          } else if (!a.FirstName && b.FirstName) {
            return -1;
          } else if (a.FirstName && !b.FirstName) {
            return 1;
          } else {
            return 0;
          }
        } else if (b.taskCount === a.taskCount) {
          return a.completeTask - b.completeTask;
        } else {
          return a.taskCount - b.taskCount;
        }
      });
    }
    if (payload.sort === "Most_Task_Completed") {
      // arr.sort((a, b) => b.completeTask - a.completeTask);
      arr.sort((a, b) => {
        if (b.taskCount === a.taskCount && b.completeTask === a.completeTask) {
          if (a.FirstName && b.FirstName) {
            return a.FirstName.charAt(0).toUpperCase().localeCompare(b.FirstName.charAt(0).toUpperCase());
          } else if (!a.FirstName && b.FirstName) {
            return -1;
          } else if (a.FirstName && !b.FirstName) {
            return 1;
          } else {
            return 0;
          }
        } else if (b.completeTask === a.completeTask) {
          return b.taskCount - a.taskCount;
        } else {
          return b.completeTask - a.completeTask;
        }
      });
    }
    if (payload.sort === "Least_Task_Completed") {
      arr.sort((a, b) => {
        if (b.taskCount === a.taskCount && b.completeTask === a.completeTask) {
          if (a.FirstName && b.FirstName) {
            return b.FirstName.charAt(0).toUpperCase().localeCompare(a.FirstName.charAt(0).toUpperCase());
          } else if (!a.FirstName && b.FirstName) {
            return -1;
          } else if (a.FirstName && !b.FirstName) {
            return 1;
          } else {
            return 0;
          }
        } else if (b.completeTask === a.completeTask) {
          return a.taskCount - b.taskCount;
        } else {
          return a.completeTask - b.completeTask;
        }
      });
      // arr.sort((a, b) => a.completeTask - b.completeTask);
    }
    state.appMembers = arr;
  },
  groupUserTasks(state,payload){
    let arr = state.userTasks
    if(arr[0]?.tasks){
      let _arr = [];
    arr.forEach((ele) => {
      _arr = _arr.concat(ele.tasks);
    })
    arr = _arr;
    }
    state.userTasks=this.$groupBy(arr,payload.key)
  },
  sortUserTasks(state, payload) {
    let arr = JSON.parse(JSON.stringify(state.userTasks));
    if (payload.key == 'title' && payload.order == 'asc') {
      
      if(arr[0].tasks){// group is true 
              arr.forEach((ele)=>{
            ele.tasks.sort((a,b)=>a.title.localeCompare(b.title))
            return ele
          })
      }
    else{
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }  
      state.userTasks = arr;
    }

    if (payload.key == 'title' && payload.order == 'desc') {
      if(arr[0].tasks){
      arr.forEach((ele)=>{
        ele.tasks.sort((a,b)=>b.title.localeCompare(a.title))
        return ele
      })
    }
    else {
      arr.sort((a, b) => b.title.localeCompare(a.title));

    }
      state.userTasks = arr;
    }
        if (payload.key == 'project' ) {
          
              if(arr[0].tasks){
                    arr.map((ele)=>{
                      let newArr=[]
                      ele.tasks.forEach((item) => {
                        if (item.project[0]?.projectId) {
                          newArr.unshift(item)
                        } else {
                          newArr.push(item)
                        }
                      });
                      if(payload.order == 'asc'){
                        newArr.sort((a,b)=>{
                          if (b.project[0]?.project?.title && a.project[0]?.project?.title) {
                          return a.project[0]?.project?.title?.localeCompare(b.project[0]?.project?.title);
                          }
                          });
                      } 
                      if(payload.order == 'desc'){
                        newArr.sort((a,b)=>{
                          if (b.project[0]?.project?.title && a.project[0]?.project?.title) {
                            return b.project[0]?.project?.title?.localeCompare(a.project[0]?.project?.title);
                            }
                        });
                    } 
                      ele.tasks=newArr
                      return ele
                    })
                state.userTasks = arr;
            }
        else {
                    
              let newArr = []

              for (let i = 0; i < arr.length; i++) {
                if (arr[i].project[0]?.projectId) {
                  newArr.unshift(arr[i])
                } else {
                  newArr.push(arr[i])
                }
              }
              if(payload.order == 'asc'){
                    newArr.sort((a, b) => {
                      if (b.project[0]?.project?.title && a.project[0]?.project?.title) {
                        return a.project[0]?.project?.title?.localeCompare(b.project[0]?.project?.title);
                        }
                    });
              }
              if(payload.order == 'desc'){
                newArr.sort((a, b) => {
                  if (b.project[0]?.project?.title && a.project[0]?.project?.title) {
                    return b.project[0]?.project?.title?.localeCompare(a.project[0]?.project?.title);
                    }
                });
          }

           
              state.userTasks = newArr;
        }
    }
    // Sort By Project Owner Name
    if (payload.key == 'owner' ) {
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
      if(payload.order == 'asc'){
         newArr.sort((a,b)=>{
            if (a.userId && b.userId) {
              return a.user.firstName.localeCompare(b.user.firstName)
            }
          });
      }
      if(payload.order == 'desc'){
        newArr.sort((a,b)=>{
           if (a.userId && b.userId) {
             return b.user.firstName.localeCompare(a.user.firstName)
           }
         });
     }
          ele.tasks=newArr
          return ele
        })
        state.userTasks = arr;
    }
    else {
      let newArr = []

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].userId!==null&&arr[i].userId!==undefined) {
          newArr.unshift(arr[i])
        } else {
          newArr.push(arr[i])
          
        }
      }
      if(payload.order == 'asc'){
            newArr.sort((a, b) => {
              if (a.userId && b.userId) {
                return a.user.firstName.localeCompare(b.user.firstName)
              }
            });
      }
      if(payload.order == 'desc'){
        newArr.sort((a, b) => {
          if (a.userId && b.userId) {
            return b.user.firstName.localeCompare(a.user.firstName)
          }
        });
  }
      
      state.userTasks = newArr;
     }
    }

    // Sort By Status
    if (payload.key == 'status' ) {
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
          if(payload.order == 'asc'){
                newArr.sort((a,b)=>{
                if (a.statusId && b.statusId) {
                  return a.statusId - b.statusId
                }
              });
          } 
          if(payload.order == 'desc'){
            newArr.sort((a,b)=>{
            if (a.statusId && b.statusId) {
              return b.statusId - a.statusId
            }
          });
      } 
       
          ele.tasks=newArr
          return ele
        })
     
      state.userTasks=arr
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
      if(payload.order == 'asc'){
        newArr.sort((a, b) => {
          if (a.statusId && b.statusId) {
            return a.statusId - b.statusId
          }
        });
      }
      if(payload.order == 'desc'){
        newArr.sort((a, b) => {
          if (a.statusId && b.statusId) {
            return b.statusId - a.statusId
          }
        });
      }
      
      
      state.userTasks = newArr;

    }
  }
    // Sort By Start Date
    if (payload.key == 'startDate' ) {
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
          if(payload.order == 'asc'){
                newArr.sort((a,b)=>{
                if (a.startDate && b.startDate) {
                  return new Date(a.startDate) - new Date(b.startDate)
                }
              });
          }
          if(payload.order == 'desc'){
            newArr.sort((a,b)=>{
            if (a.startDate && b.startDate) {
              return new Date(b.startDate) - new Date(a.startDate)
            }
          });
      }
        
          ele.tasks=newArr
          return ele
        })
     
        state.userTasks=arr
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
          if(payload.order == 'asc'){
            newArr.sort((a, b) => {
                if (a.startDate && b.startDate) {
                  return new Date(a.startDate) - new Date(b.startDate)
                }
              });
          }
          if(payload.order == 'desc'){
            newArr.sort((a, b) => {
              if (a.startDate && b.startDate) {
                return new Date(b.startDate) - new Date(a.startDate)
              }
            });
          }
        
          state.userTasks = newArr;

       }

    }


    // Sort By Due Date
    if (payload.key == 'dueDate' ) {
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
          if(payload.order == 'asc'){
              newArr.sort((a,b)=>{
              if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate)
              }
            });
          }
          if(payload.order == 'desc'){
            newArr.sort((a,b)=>{
            if (a.dueDate && b.dueDate) {
              return new Date(b.dueDate) - new Date(a.dueDate)
            }
          });
        }
         
          ele.tasks=newArr
          return ele
        })
     
        state.userTasks=arr
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
          if(payload.order == 'asc'){
                 newArr.sort((a, b) => {
                      if (a.dueDate && b.dueDate) {
                        return new Date(a.dueDate) - new Date(b.dueDate)
                      }
                    });
          }
          if(payload.order == 'desc'){
            newArr.sort((a, b) => {
              if (a.dueDate && b.dueDate) {
                return new Date(b.dueDate) - new Date(a.dueDate)
              }
            });
          }
         
          state.userTasks = newArr;

       }
      
    }


    // Sort By Priority
    if (payload.key == 'priority' ) {

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
          if(payload.order == 'asc'){
              newArr.sort((a,b)=>{
              if (a.priorityId && b.priorityId) {
                return a.priority.id - b.priority.id;
              }
            });
          }
          if(payload.order == 'desc'){
            newArr.sort((a,b)=>{
            if (a.priorityId && b.priorityId) {
              return b.priority.id - a.priority.id;
            }
          });
        }
          ele.tasks=newArr
          return ele
        })
     
        state.userTasks=arr
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
            if(payload.order == 'asc'){
                newArr.sort((a, b) => {
                if (a.priorityId && b.priorityId) {
                  return a.priority.id - b.priority.id;
                }
              });
            }
            if(payload.order == 'desc'){
              newArr.sort((a, b) => {
              if (a.priorityId && b.priorityId) {
                return b.priority.id - a.priority.id;
              }
            });
          }
           
            state.userTasks = newArr;

       }

      
     
    }

    // Sort By Department
    if (payload.key == 'department' ) {

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
          if(payload.order == 'asc'){
              newArr.sort((a,b)=>{
              if (a.departmentId && b.departmentId) {
                return a.department.title.localeCompare(b.department.title)
              }
            });
          }
          if(payload.order == 'desc'){
            newArr.sort((a,b)=>{
            if (a.departmentId && b.departmentId) {
              return b.department.title.localeCompare(a.department.title)
            }
          });
        }
          ele.tasks=newArr
          return ele
        })
     
        state.userTasks=arr
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
            if(payload.order == 'asc'){
              return a.department.title.localeCompare(b.department.title);
            }
            if(payload.order == 'desc'){
              return b.department.title.localeCompare(a.department.title);
            }

          }
        });
        state.userTasks = newArr;

       }
      
    }


    // Sort By Difficulty
    if (payload.key == 'difficultyId' ) {

      if(arr[0].tasks)
      {
        arr.map((ele)=>{
          let newArr=[]
          ele.tasks.forEach((item) => {
            if (item.difficultyId) {
              newArr.unshift(item)
            } else {
              newArr.push(item)
            }
          });
          if(payload.order == 'asc'){
              newArr.sort((a,b)=>{
              if (a.difficultyId && b.difficultyId) {
                return a.difficultyId - b.difficultyId;
              }
            });
          }
          if(payload.order == 'desc'){
            newArr.sort((a,b)=>{
            if (a.difficultyId && b.difficultyId) {
              return b.difficultyId - a.difficultyId;
            }
          });
        }
          ele.tasks=newArr
          return ele
        })
     
        state.userTasks=arr
      }
      else 
      {
            let newArr = []

            for (let i = 0; i < arr.length; i++) {
              if (arr[i].difficultyId) {
                newArr.unshift(arr[i])
              } else {
                newArr.push(arr[i])
              }
            }
            if(payload.order == 'asc'){
                newArr.sort((a, b) => {
                if (a.difficultyId && b.difficultyId) {
                  return a.difficultyId - b.difficultyId;
                }
              });
            }
            if(payload.order == 'desc'){
              newArr.sort((a, b) => {
              if (a.difficultyId && b.difficultyId) {
                return b.difficultyId - a.difficultyId;
              }
            });
          }
           
            state.userTasks = newArr;

       }
     
    }
   

  },
  setUser(state, payload) {
    state.user = payload;
  },

  setUser2(state, payload) {
    state.user2 = payload;
  },

  setTeamMembers(state, payload) {
    state.teamMembers = payload;
  },

  setAppMembers(state, payload) {
    state.appMembers = payload.map((ele) => {
      return { ...ele, taskCount: 0, completeTask: 0 };
    });
  },

  setUserTasks(state, payload) {
    state.userTasks = payload
  },

  setSideBarUser(state,payload){
    state.sideBarUser=payload
  },
  setInitialUserTasks(state,payload) {
    payload.initial.sort((a, b) => {
      if (a.priorityId && b.priorityId) {
        return a.priorityId - b.priorityId;
      }
    });
    state.initialData = payload.initial
    
  },
  setUsersList(state, payload){
    state.usersList = payload.map(u => {
      return {email: u.Email, label: u.FirstName + " " + u.LastName, img: u.Photo, value: u.Id, role: u.Role}
    })
    state.usersList.unshift({ label: 'Select user', value: null })
  }

};


export const actions = {
async setFetchUserTasks (ctx,payload) {
  ctx.commit('setFetchUserTasks', payload);
},
  async setUser(ctx, payload) {
    await ctx.commit('setUser', payload);
  },

  async setUser2(ctx, payload) {
    await ctx.commit('setUser2', payload);
  },

  async setTeamMembers(ctx) {
    const members = await this.$axios.$get(`${process.env.ORG_API_ENDPOINT}/${ctx.rootState.user.user.subb}/users`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    ctx.commit("setTeamMembers", members)
    ctx.commit("setUsersList", members)

    if (JSON.parse(localStorage.getItem('user')).subr == 'USER') {
      const userlist = await this.$axios.$get("/user/list", {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("accessToken")}` }
      })
      if (userlist.statusCode == 200) {
        let userTeam = members.filter(u => {
          if (userlist.data.userIds.includes(u.Id)) {
            return u
          }
        })
        ctx.commit("setAppMembers", userTeam)
      }
    } else {
      ctx.commit("setAppMembers", members)
    }

  },

  async setUserTasks(ctx, payload) {
    const res = await this.$axios.$get('user/tasks', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, 'Filter': payload.filter || 'all' }
    });

    if (res.data) {
      ctx.commit('setUserTasks', res.data);
      return res.data
    }
  },
  
  async getUserTasks(ctx,payload){
    const res = await this.$axios.get("user/user-tasks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        Filter: 'all',
        userid: payload.userId,
      },
    });
   
    if(res.data.statusCode==200){
      // ctx.commit('setInitialUserTasks', {initial:res.data.data});
      return res.data.data
    }
  
  },
  sortUserTasks(ctx, payload) {
    ctx.commit('sortUserTasks', payload)
  },

  async fetchUserHistory(ctx, payload) {
    const hist = await this.$axios.get('user/user-history', {
      headers: {
        "page": payload.page,
        "Authorization": "Bearer " + localStorage.getItem("accessToken"),
      }
    })
    return hist
  },
  // sidebar user info
  setSideBarUser(ctx,payload){
    ctx.commit('setSideBarUser',payload)
  }
};
