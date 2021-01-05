
const state = {
  name: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.name = token
  }
}

const actions = {
  setRoles({ commit }, roles) {
    commit('SET_ROLES', roles)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
