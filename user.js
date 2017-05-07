'use strict';
const request = require('request');
const config = require('./config');
const pg = require('pg');
pg.defaults.ssl = true;


module.exports = function(callback, userId) {
    request({
        uri: 'https://graph.facebook.com/v2.7/' + userId,
        qs: {
            access_token: config.FB_PAGE_TOKEN
        }

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var user = JSON.parse(body);

            if (user.first_name) {
                console.log("FB user: %s %s, %s",
                    user.first_name, user.last_name, user.gender);


                pg.connect(process.env.DATABASE_URL, function (err, client) {
                    if (err) throw err;
                    console.log('connect to postgres. Searching for a user...');
                    let rows = [];
                    client
                        .query(`SELECT id FROM users WHERE fb_id = '${userId}' LIMIT 1`)
                        .on('row', function (row) {
                            rows.push(row);
                        })
                        .on('end', () => {
                            if (rows.length === 0 ) {
                                let sql = 'INSERT INTO users (fb_id, first_name, last_name, profile_pic, ' +
                                    'locale, timezone, gender)' +
                                    'VALUES ($1, $2, $3, $4, $5, $6, $7)';

                                client.query(sql, [
                                    userId,
                                    user.first_name,
                                    user.last_name,
                                    user.profile_pic,
                                    user.locale,
                                    user.timezone,
                                    user.gender
                                ])
                            }
                        })

                })
                callback(user);

            } else {
                console.log("Cannot get data for fb user with id",
                    userId);
            }
        } else {
            console.error(response.error);
        }

    });
}
