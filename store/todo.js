
export const strict = false;

export const state = () => ({
  todos: [],
  initialData:[],
  gridType:"list",
  groupByValue:"default",
  taskCount:0

});

export const getters = {

  getAllTodos(state) {
    return state.todos;
  },
  getGridType(state){

    return state.gridType
  },
  getGroupBy (state) {
    return state.groupByValue 
  },
  getTaskCount (state) {
    return state.taskCount
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
    state.taskCount = payload.reduce((acc, td) => acc + td.tasks.length, 0)
  },
  setGroupBy(state,payload) {
    state.groupByValue=payload
  },
  fetchTodos(state, payload) {
    let arr = [...payload];
    arr.sort((a, b) => a.uOrder - b.uOrder);
    state.todos = arr;
    state.initialData = arr;
  },

  createTodo(state, payload) {
    let ns = payload
    ns.tasks = []
    state.todos.unshift(ns);
  },
  gridType(state,payload){
    state.gridType=payload.gridType
  },
  setTodos(state, payload) {
    state.todos = payload;
  },

  /*groupMyTasks(state, payload) {
    let arr = JSON.parse(JSON.stringify(state.todos));
    arr.filter((item)=>{
      if(item.tasks.length>0){
        return item
      }
    })

    if(arr[0].tasks){
      let _arr = [];
        arr.forEach((ele) => {
          _arr = _arr.concat(ele.tasks);
        });
        arr = _arr;
    }
    if(payload.sName==""){
      state.todos=state.arr
    }
    else {
     state.todos=this.$groupBy(arr,payload.sName)
    }
  },*/
};

export const actions = {

  async fetchTodos(ctx, payload) {
    const res = await this.$axios.$get('/todo/all', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, 'Filter': payload.filter ? payload.filter : 'all', 'groupby': payload.groupBy || "" }
    });

    if (res.statusCode == 200) {
      ctx.commit('setTodos', res.data);
      ctx.commit('setTaskCount', res.data)
      /*if(payload.sName && payload.sName!=="default"){
        const data = {
          sName: payload.sName,
          team: ctx.rootState.user.teamMembers
        }
        ctx.commit('groupMyTasks', data)
      }*/
    }

    return res
  },

  setTodos(ctx, payload) {
    ctx.commit('setTodos', payload)
    ctx.commit('setTaskCount',payload)
  },

  async createTodo(ctx, payload) {
    const res = await this.$axios.$post('/todo', payload, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    ctx.commit('createTodo', res.data)
    return res
  },

  async renameTodo(ctx, payload) {

    const res = await this.$axios.$put("/todo", payload, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })

    return res
  },

  async deleteTodo(ctx, payload) {
    // console.log(payload)
    const res = await this.$axios.$delete("/todo", {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      data: { id: payload.id, retainTasks: payload.retainTasks }
    })

    return res
  },

  sortTodoTasks(ctx, payload) {
    ctx.commit('sortTodoTasks', payload)
  }

};
