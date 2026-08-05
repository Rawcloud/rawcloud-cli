const axios = require('axios')
axios.interceptors.response.use(res => {
    return res.data
})
async function getRepoList(){
    // return axios.get('https://gitee.com/api/v5/repos/rawcloud/rstp-online-preview')
	return axios.get('https://gitee.com/api/v5/users/rawcloud/repos?type=all&sort=full_name&direction=asc&page=1&per_page=20')
}
module.exports = {
    getRepoList
}
