/*
1) делаем билд с галочкой "Publish live update content"
2) из папки проекта(D:\Defold\projects\Match3-core\app\build\resources) берем архив ресурсов и переносим в папку куда билдился весь проект (D:\Defold\projects\builds\wasm-web\Matсh3)
3) вызываем node pack_resources.js run "D:/Defold/projects/builds/wasm-web/Matсh3"
*/

const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const archiver = require('archiver');
const { Command } = require('commander');
const sha1 = require('js-sha1');


const config_path = "./resources.json";

function main() {
    load_config_async(on_config_loaded);
}

function load_config_async(on_loaded) {
    const program = new Command();
    program.command('run').argument('[string]', 'build_path').action((path) => {
        fs.readFile(config_path, 'utf8', (err, data) => {
            if (err)
                throw err;
            const config = JSON.parse(data);
            if (path) config.build_path = path
            on_loaded(config);
        });
    });

    program.parse();
}

function on_config_loaded(config) {
    parse_resource_graph_async(config, loading_resources_from_source_zip);
}

function parse_resource_graph_async(config, on_parsed) {
    const graph_path = config.graph_path;
    fs.readFile(graph_path, 'utf8', (err, data) => {
        if (err) throw err;

        const resources = [];
        const resources_graph = JSON.parse(data);
        for (const resource_path of config.resources) {
            const resource = { name: resource_path.match(/\/([^\/]+)\./)[1], hexes: [] };
            find_resource(resources_graph, resource_path, resource.hexes);
            resources.push(resource);
        }

        on_parsed(config, resources);
    });
}

function find_resource(resources_graph, resource_path, resources) {
    const resource_data = resources_graph.find((resource) => resource.path == resource_path);
    if (resource_data == undefined || resource_data.isInMainBundle) return;

    if (!resources.includes(resource_data.hexDigest)) {
        resources.push(resource_data.hexDigest);
    }

    for (const dependency of resource_data.children)
        find_resource(resources_graph, dependency, resources);
}

async function loading_resources_from_source_zip(config, resources) {
    const source_zip = await find_source_zip(config);
    fs.mkdirSync(config.build_path + '/resources/', { recursive: true });
    decompress(source_zip).then((files) => {
        const manifest = {};
        for (const resource of resources) {
            const dependencies = resource.hexes.slice(1);
            const hash = sha1.create();
            for (const hex of dependencies)
                hash.update(hex);
            const resource_hash = hash.hex()

            const path = config.build_path + '/resources/' + resource_hash + '.zip';
            const stream = fs.createWriteStream(path);
            const zip = archiver('zip');
            zip.pipe(stream);

            for (const hex of resource.hexes) {
                for (const file of files) {
                    if (file.path != hex) continue;
                    zip.append(file.data, { name: file.path });
                }
            }

            const liveupdate_manifest = 'liveupdate.game.dmanifest';
            for (const file of files) {
                if (file.path != liveupdate_manifest) continue;
                zip.append(file.data, { name: file.path });
            }

            zip.finalize();

            manifest[resource.name] = {
                hash: resource_hash,
                dependencies
            };
        }

        const data = JSON.stringify(manifest);
        fs.writeFile(config.build_path + '/resources/manifest.json', data, () => { });
    });

}

const getSortedFiles = async (dir) => {
    const files = await fs.promises.readdir(dir);

    return files
        .map(fileName => ({
            name: fileName,
            time: fs.statSync(`${dir}/${fileName}`).mtime.getTime(),
        }))
        .sort((a, b) => a.time - b.time)
        .map(file => file.name);
};


async function find_source_zip(config) {
    const p = './app/build/resources/';
    const files = await getSortedFiles(p);
    const last_file = files[files.length - 1];
    console.log('file:', last_file);
    return p + last_file;
}

String.prototype.hashCode = function () {
    var hash = 0,
        i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

main();