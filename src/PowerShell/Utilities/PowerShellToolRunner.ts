import * as io from '@actions/io';
import * as exec from '@actions/exec';

export default class PowerShellToolRunner {
    static psPath: string;

    static async init() {
        console.log(`PowerShellToolRunner.psPath ${PowerShellToolRunner.psPath}`)
        if(!PowerShellToolRunner.psPath) {
            console.log(`${await io.which("pwsh", true)}`)
            PowerShellToolRunner.psPath = await io.which("pwsh", true);
        }
    }

    static async executePowerShellScriptBlock(scriptBlock: string, options: any = {}) {
        console.log(`scriptBlock ${scriptBlock}`)
        await exec.exec(`${PowerShellToolRunner.psPath} -Command`, [scriptBlock], options)
    }
}