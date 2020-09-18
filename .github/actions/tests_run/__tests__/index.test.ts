import * as core from '@actions/core'
import { run } from '../index'

describe('Install app', () => {
    const original = process.env
    const envs = {
        appSysID: '',
        password: 'test',
        scope: '',
        snowInstallInstance: 'test',
        username: 'test',
    }
    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
        process.env = { ...original, ...envs }
        jest.spyOn(core, 'setFailed')
    })
    it(`run with params`, () => {
        run()

        expect(core.setFailed).toHaveBeenCalledWith('Please specify scope or sys_id')
    })
    // afterAll(() => {
    //     process.env = original
    // })
})
