module.exports = {
    "development": {
        "url": "http://localhost:4200",
        "autocommit": false,
        "roleAdmin": 1,
        "userIdAdmin": 1,
        "emailTest": "jmddesarrollo@gmail.com",
        "folderLogs": "./data/logs/",
        "folderSH": "./files/sh/",
        "permission_permissions_manager": 1,
        "permission_users_manager": 2,
        "APP": {
            "username": process.env.APP_BD_USER,
            "password": process.env.APP_BD_PASSWORD,
            "database": `app-base`,
            "options": {
                "host": process.env.APP_BD_HOST,
                "port": "3306",
                "dialect": "mysql",
                "logging": false,
                "pool": {
                    "max": 5,
                    "min": 0,
                    "idle": 30000,
                    "acquire": 30000
                }
            }
        }
    },
    "production": {
        "url": `http://194.164.165.161:${process.env.APP_SERVER_PORT}`,
        "autocommit": false,
        "roleAdmin": 1,
        "userIdAdmin": 1,
        "emailTest": "jmddesarrollo@gmail.com",
        "folderLogs": "/data/logs/",
        "folderSH": `/home/app-base/files/sh/`,
        "permission_permissions_manager": 1,
        "permission_users_manager": 2,
        "APP": {
            "username": process.env.APP_BD_USER,
            "password": process.env.APP_BD_PASSWORD,
            "database": "app-base",
            "options": {
                "host": process.env.APP_BD_HOST,
                "port": "3306",
                "dialect": "mysql",
                "logging": false,
                "pool": {
                    "max": 5,
                    "min": 0,
                    "idle": 30000,
                    "acquire": 30000
                }
            }
        }
    }
}