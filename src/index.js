const DEFAULT_PREFIX = ['NEM', 'NEA'];

window.addEventListener('load', function () {
    showOrHiddePrefixContainer();
});

function showOrHiddePrefixContainer() {
    const ul = document.getElementById("list");
    const prefixContainer = document.getElementById("prefix-container");
    prefixContainer.hidden = ul.childNodes.length <= 1;
}


function xmlRefactor({xml, prefix}) {
    const xmlDoc = $.parseXML(xml);
    $(xmlDoc).find("Placemark").each(function () {
        let str = $(this).find("description").text();
        let name = getName({str: str, prefix: prefix});
        if (name) $(this).append(`<name>${name}</name>`);
    });
    return saveXML({xml: xmlDoc});
}

function getName({str, prefix}) {
    let name = null;
    prefix.forEach(function (e, i) {
        let nameInit = str.indexOf(prefix[i]);
        if (nameInit !== -1) {
            let nameEnd;
            for (let x = nameInit + prefix[i].length; x < str.length; x++) {
                if (isNaN(str.charAt(x))) {
                    nameEnd = x;
                    break;
                }
            }
            name = str.substring(nameInit, nameEnd);
        }
    });
    return name;
}

function processZIP() {
    const selectedZip = document.getElementById("zip").files[0];
    const isZip = selectedZip?.name.includes("kmz") || selectedZip?.type.includes("kmz")
    if (isZip) {
        let xml;
        const zip = new JSZip();
        let prefix = getPrefix();
        if (!prefix) prefix = DEFAULT_PREFIX;
        zip.loadAsync(selectedZip).then(async function (zip) {
            const existKMLDoc = zip.file("doc.kml");
            if (existKMLDoc) {
                xml = await zip.file("doc.kml").async("string");
                let xmlDoc = xmlRefactor({xml: xml, prefix: prefix});
                zip.remove('doc.kml');
                zip.file('doc.kml', xmlDoc);
                zip.generateAsync({type: "blob"}).then(function (content) {
                    saveAs(content, selectedZip.name);
                    toastr.success("Se ha generado con éxito", 'Procesar .KMZ');
                    setTimeout(function () {
                        window.location.reload();
                    }, 3000);
                });
            } else {
                toastr.error("Este no es un archivo válido de Google Earth Pro. Selecciona un archivo válido", 'error');
            }
        }, function () {
            toastr.error("Ocurrió un error al procesar el archivo. Asegúrate que el archivo es válido y que está en buen estado", 'Procesar');
        });
    } else {
        toastr.error("Selecciona un archivo válido", 'Procesar');
    }
}

function saveXML({xml}) {
    let serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(xml);
    return new Blob([xmlString], {type: "text/plain;charset=utf-8"});
}

function addList() {
    const str = document.getElementById("prefix");
    const ul = document.getElementById("list");
    const li = document.createElement("li");
    const icon = document.createElement("i")
    const allPrefix = getPrefix();
    if (allPrefix && allPrefix.includes(str.value)) {
        toastr.info(`"${str.value}" ya existe en la lista`, 'Prefijos');
        return;
    }
    if (str.checkValidity() && str.value) {
        li.appendChild(document.createTextNode(str.value));
        icon.title = 'Borrar';
        icon.classList.add('fa-solid');
        icon.classList.add('fa-trash-can');
        li.appendChild(icon);
        li.classList.add('list-group-item');
        li.classList.add('item');
        li.addEventListener('click', (_) => {
            li.parentNode.removeChild(li);
            showOrHiddePrefixContainer();
        });
        ul.appendChild(li);
        str.value = '';
    } else {
        toastr.info("Prefijo no válido [ A-Z a-z 0-9 ]", 'Prefijos');
    }
    showOrHiddePrefixContainer();
}

function getPrefix() {
    const items = document.getElementsByClassName("item");
    if (items.length) {
        const setPrefix = [];
        for (let i = 0; i < items.length; i++) {
            setPrefix.push(items[i].firstChild.nodeValue);
        }
        return setPrefix;
    }
    return null;
}
