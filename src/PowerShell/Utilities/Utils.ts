import * as os from 'os';

import Constants from '../Constants';
import ScriptBuilder from './ScriptBuilder';
import PowerShellToolRunner from './PowerShellToolRunner';

export default class Utils {
    /**
     * Add the folder path where Az modules are present to PSModulePath based on runner
     * @param azPSVersion
     * If azPSVersion is empty, folder path in which all Az modules are present are set
     * If azPSVersion is not empty, folder path of exact Az module version is set
     */
    static setPSModulePath(azPSVersion: string = "") {
        let modulePath: string = "";
        const runner: string = process.env.RUNNER_OS || os.type();
        switch (runner.toLowerCase()) {
            case "linux":
                modulePath = `/usr/share/${azPSVersion}:`;
                break;
            case "windows":
            case "windows_nt":
                modulePath = `C:\\Modules\\${azPSVersion};`;
                break;
            case "macos":
            case "darwin":
                throw new Error(`OS not supported`);
            default:
                throw new Error(`Unknown os: ${runner.toLowerCase()}`);
        }
        process.env.PSModulePath = `${modulePath}${process.env.PSModulePath}`;
    }

    static async getLatestModule(moduleName: string): Promise<string> {
        let output: string = "";
        const options: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
                }
            }
        };
        console.log(`options: ${options}`);
        console.log(`Running PowerShellToolRunner.init()`);
        await PowerShellToolRunner.init();
        console.log(`Running PowerShellToolRunner.executePowerShellScriptBlock`);
        await PowerShellToolRunner.executePowerShellScriptBlock(new ScriptBuilder()
                                .getLatestModuleScript(moduleName), options);
        console.log(`Running JSON.parse`);
        const result = JSON.parse(output.trim());
        console.log(`JSON results: ${result}`);
        if (!(Constants.Success in result)) {
            throw new Error(result[Constants.Error]);
        }
        console.log(`Running result[Constants.AzVersion]`);
        const azLatestVersion: string = result[Constants.AzVersion];
        if (!Utils.isValidVersion(azLatestVersion)) {
            console.log(`azLatestVersion: ${azLatestVersion}`);
            throw new Error(`Invalid AzPSVersion: ${azLatestVersion}`);
        }
        console.log(`Running azLatestVersion`);
        return azLatestVersion;
    }

    static isValidVersion(version: string): boolean {
        return !!version.match(Constants.versionPattern);
    }
}

