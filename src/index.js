const DEFAULT_PREFIX = ['NEM', 'NEA'];

function xmlRefactor({xml, prefix}){
  var xmlString = xml;
  var xmlDoc = $.parseXML(xmlString);
  $(xmlDoc).find("Placemark").each(function(){    
    let str = $(this).find("description").text();
    let name = getName({str: str, prefix: prefix});
    if (name) $(this).append(`<name>${name}</name>`);
  });
  return saveXML({xml:xmlDoc});
}

function getName({str, prefix}){
  let name = null;
  prefix.forEach(function(e, i, a){
    let nameInicio = str.indexOf(prefix[i]);
    if (nameInicio != -1) {
      var nameEnd;
      for (let x = nameInicio + prefix[i].length; x < str.length; x++) {
        if (isNaN(str.charAt(x))) {
          nameEnd = x;
          break;
        }
      }
      name = str.substring(nameInicio, nameEnd);
  }});
  return name;
}

function openZIP() {
  var xml;
  var input = document.getElementById("zip");
  var zip = new JSZip();
  let prefix = getPrefix();
  if(!prefix) prefix = DEFAULT_PREFIX;
  zip.loadAsync(input.files[0]).then( async function (zip) {
      xml = await zip.file("doc.kml").async("string");
      let xmlDoc = xmlRefactor({xml:xml, prefix: prefix});
      zip.remove('doc.kml');
      zip.file('doc.kml', xmlDoc);
      zip.generateAsync({ type: "blob" }).then(function (content) {
          saveAs(content, input.files[0].name);
          toastr.success("Se ha generado con éxito",'Procesar .KMZ');
          setTimeout(function() {
            window.location.reload();
          }, 3000);
        });
    },
    function () {
      toastr.info("Selecciona un archivo válido",'Procesar');
    }
  );
}
function saveXML({ xml }) {
  let serializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(xml);
  let blob = new Blob([xmlString], { type: "text/plain;charset=utf-8" });
  return blob;
}
function addList() {
  var str = document.getElementById("prefix");
  var ul = document.getElementById("list");
  var li = document.createElement("li");
  if(str.checkValidity() && str.value){
    li.appendChild(document.createTextNode(str.value));
    li.classList.add('list-group-item');
    li.classList.add('item');
    ul.appendChild(li);
    str.value = '';
  }else{
    toastr.info("Solo letras",'Prefijos');
  }
}
function getPrefix(){ 
  var items = document.getElementsByClassName("item");
  if(items.length){
    var setPrefix = []; 
    for (i = 0; i < items.length; i++) {
      setPrefix.push(items[i].innerHTML);
    }
    return setPrefix;
  }
  return null;
}
/* function toZIP() {
  var zip = new JSZip();
  // Agrega un archivo de texto
  zip.file("Hello.txt", "Hello World\n");
  // Genera un directorio dentro de la estructura de archivos Zip
  var img = zip.folder("images");
  // Agregar un archivo al directorio, en este caso una imagen con URI de datos como contenido
  //img.file("smile.gif", imgData, {base64: true});
  // Genera el archivo zip de forma asíncrona
  zip.generateAsync({ type: "blob" }).then(function (content) {
      // Descargar el archivo Zip
      saveAs(content, "archive.zip");
    });
} */
/* function xmlEdit({xml}) {
    $.get("doc.kml", function (xml) { $(xml).find("Placemark").each(function () {
        let description = $(this).find("description").text();
        let CODE = "NEM";
        let nameInicio = description.indexOf(CODE);
        if (nameInicio != -1) {
          var nameEnd;
          for (let i = nameInicio + CODE.length; i < description.length; i++) {
            if (isNaN(description.charAt(i))) {
              nameEnd = i;
              break;
            }
          }
          let name = description.substring(nameInicio, nameEnd);
          $(this).append(`<name>${name}</name>`);
        }
      });
      saveXML({ xml: xml }); 
      return xml;
    });
} */