export const state = () => ({
  user: null,
  user2: null,
  teamMembers: [],
  userTasks: []
});

export const getters = {
  getUser(state) {
    return state.user;
  },

  getUser2(state) {
    return state.user2;
  },

  getTeamMembers(state) {
    let members = []
    state.teamMembers.map(t => {
      members.push({ label: t.FirstName + ' ' + t.LastName, firstName: t.FirstName, lastName: t.LastName, email: t.Email, icon: "user", id: t.Id, status: t.Status, role: t.Role, avatar: t.Photo })
    })
    return members
  },

  getUserTasks(state) {
    return state.userTasks;
  }
};

export const mutations = {
  setUser(state, payload) {
    state.user = payload;
  },

  setUser2(state, payload) {
    state.user2 = payload;
  },

  setTeamMembers(state, payload) {
    state.teamMembers = payload;
  },

  setUserTasks(state, payload) {
    state.userTasks = payload
  },

  sortUserTasks(state, payload) {

    // sort By Title
    if(payload.sName == 'name' && payload.order == 'asc') {
      state.userTasks.sort((a,b) => a.title.localeCompare(b.title))
    }

    if(payload.sName == 'name' && payload.order == 'desc') {
      state.userTasks.sort((a,b) => b.title.localeCompare(a.title))
    }

    // sort By Project
    if(payload.sName == 'projectId' && payload.order == 'asc') {
      state.userTasks.sort((a,b) => a.project[0].project.title.localeCompare(b.project[0].project.title))
    }

    if(payload.sName == 'projectId' && payload.order == 'desc') {
      state.userTasks.sort((a,b) => b.project[0].project.title.localeCompare(a.project[0].project.title))
    }

    // sort By Status
    if(payload.sName == 'status' && payload.order == 'asc') {
      state.userTasks.sort((a,b) => a.status.text.localeCompare(b.status.text))
    }

    if(payload.sName == 'status' && payload.order == 'desc') {
      state.userTasks.sort((a,b) => b.status.text.localeCompare(a.status.text))
    }

    // sort by create date
    if(payload.sName == 'createdAt' && payload.order == 'asc') {
      state.userTasks.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    if(payload.sName == 'createdAt' && payload.order == 'desc') {
      state.userTasks.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    // sort by due date
    if(payload.sName == 'dueDate' && payload.order == 'asc') {
      state.userTasks.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
    }

    if(payload.sName == 'dueDate' && payload.order == 'desc') {
      state.userTasks.sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate))
    }

    // sort by priority
    if(payload.sName == 'priority' && payload.order == 'asc') {
      state.userTasks.sort((a,b) => a.priority.text.localeCompare(b.priority.text))
    }

    if(payload.sName == 'priority' && payload.order == 'desc') {
      state.userTasks.sort((a,b) => b.priority.text.localeCompare(a.priority.text))
    }
  }
};


export const actions = {
  async setUser(ctx, payload) {
    await ctx.commit('setUser', payload);
  },

  async setUser2(ctx, payload) {
    await ctx.commit('setUser2', payload);
  },

  async setTeamMembers(ctx) {
    const members = await this.$axios.$get(`${process.env.ORG_API_URL}/${ctx.rootState.user.user.subb}/users`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    ctx.commit("setTeamMembers", members)
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

  sortUserTasks(ctx, payload) {
    ctx.commit('sortUserTasks', payload)
  }
};
