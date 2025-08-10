const oracledb = require('oracledb');

async function getConnection() {
  return await oracledb.getConnection({
    user: 'system',
    password: 'senha',
    connectString: 'localhost/XE'
  });
}

module.exports = { getConnection };
