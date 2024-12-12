/*
1) делаем билд с галочкой "Publish live update content"
2) из папки проекта(D:\Defold\projects\Match3-core\app\build\resources) берем архив ресурсов и переносим в папку куда билдился весь проект (D:\Defold\projects\builds\wasm-web\Matсh3)
3) вызываем node pack_resources.js run "D:/Defold/projects/builds/wasm-web/Matсh3"
*/

// TODO: get last created zip archive in resource directory instead copy past file by hand

const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const archiver = require('archiver');
const { Command } = require('commander');


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

function loading_resources_from_source_zip(config, resources) {
    const source_zip = find_source_zip(config);
    decompress(source_zip).then((files) => {
        const manifest = {};
        for (const resource of resources) {

            const resource_hash = resource.hexes[0]; // first is hash of collection
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

            manifest[resource.name] = resource_hash;
        }

        const data = JSON.stringify(manifest);
        fs.writeFile(config.build_path + '/resources/manifest.json', data, () => { });
    });

    fs.unlinkSync(source_zip);
}

function find_source_zip(config) {
    const files = fs.readdirSync(config.build_path + '/resources');
    for (const filename of files) {
        const full_filename = path.join(config.build_path + '/resources', filename);
        const stat = fs.lstatSync(full_filename);
        if (!stat.isDirectory() && filename.endsWith('.zip'))
            return full_filename;
    }
}

main();