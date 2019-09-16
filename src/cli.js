import arg from 'arg';
import inquirer from 'inquirer'
import fs from 'fs';
import simpleGit from 'simple-git';

import { PathPrompt } from 'inquirer-path';
inquirer.prompt.registerPrompt('path', PathPrompt);

// import { createProject } from './main';

async function promptForOptions() {
    const questions = [];

    questions.push({
        type: 'path',
        name: 'projectDirectory',
        message: 'Enter a path. EG: D:\\ or D:\\projects\\',
        default: process.cwd(),
    });

    questions.push({
        type: 'number',
        name: 'passwordLength',
        message: 'Password length: ',
        default: 5,
        validate: function validatePassword(value) {
            return value > 0;
        }
    })

    questions.push({
        type: 'confirm',
        name: 'usernameRequired',
        message: 'Do you want username neccessary?',
        default: true
    }, {
        when: function (response) {
            return response.usernameRequired;
        },
        type: 'number',
        name: 'usernameLength',
        message: 'Username length: ',
        default: 5,
        validate: function validateUsername(value) {
            return value > 0;
        }
    })

    questions.push({
        type: 'confirm',
        name: 'passwordAlphaNumeric',
        message: 'Do you want password to be alphanumeric?',
        default: true
    })

    questions.push({
        type: 'list',
        name: 'loginField',
        message: 'User can login with?',
        choices: ['username', 'email', 'username_email']
    })

    questions.push({
        type: 'confirm',
        name: 'emailVerification',
        message: 'Do you want email verification?',
        default: true
    }, {
        when: function (response) {
            return response.emailVerification;
        },
        name: 'emailExpireTime',
        message: 'Email expiration time? (in minutes)',
        type: 'number',
        default: 5,
        validate: function validateExpireTime(value) {
            return value > 0;
        }
    }, {
        when: function (response) {
            return response.emailVerification;
        },
        type: 'confirm',
        name: 'loginWithoutVerification',
        message: 'Allow user to login without email verification?',
        default: true
    })

    questions.push({
        type: 'list',
        name: 'socialLogin',
        message: 'Which social login is allowed?',
        choices: ['facebook', 'google', 'both', 'none'],
        default: 'none'
    })

    questions.push({
        type: 'confirm',
        name: 'socialVerification',
        message: 'Do you want social account verification?',
        default: true
    }, {
        when: function (response) {
            return !response.emailVerification && response.socialVerification;
        },
        name: 'emailExpireTime',
        message: 'Email expiration time? (in minutes)',
        type: 'number',
        default: 5,
        validate: function validateExpireTime(value) {
            return value > 0;
        }
    }, {
        when: function (response) {
            return !response.emailVerification && response.socialVerification;
        },
        type: 'confirm',
        name: 'loginWithoutVerification',
        message: 'Allow user to login without email verification?',
        default: true
    })


    const answers = await inquirer.prompt(questions);
    return answers;
}

async function cloneRepo(projectDirectory) {
    await simpleGit().clone('https://github.com/hamza2797/express-template-generator.git', projectDirectory + '\\express-template')
}

async function createConfig(options) {
    const data = `module.exports = {
        validation: {
            passwordLength: ${options.passwordLength},
            usernameRequired: ${options.usernameRequired},
            usernameLength: ${options.usernameLength},
            passwordAlphaNumeric: ${options.passwordAlphaNumeric},
            loginField: '${options.loginField}'
        },
        verification: {
            emailVerification: ${options.emailVerification},
            emailExpireTime: ${options.emailExpireTime},
            loginWithoutVerification: ${options.loginWithoutVerification},
            socialVerification: ${options.socialVerification},
        },
        routes: {
            socialLogin: '${options.socialLogin}'
        }
    };`
    await fs.writeFile(options.projectDirectory + '\\express-template\\src\\util\\config.js', data, function (err) {
        if (err) throw err;
        console.log('Config created!');
    });
}


export async function cli(args) {
    let options = await promptForOptions();
    console.log(options);
    await cloneRepo(options.projectDirectory);

    console.log('repo generated')
    await createConfig(options);
}