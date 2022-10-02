const imgInput = document.getElementById("img");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var width = 0;
var height = 0;

imgInput.addEventListener("change", (event) => {
  console.log(imgInput.files[0]);
  const file = imgInput.files[0];
  const datatransfert = new DataTransfer();
  const blobURL = window.URL.createObjectURL(file);
  const img = new Image();
  img.src = blobURL;
  img.onload = function () {
    URL.revokeObjectURL(this.src);
    const [newWidth, newHeight] = calculateSize(img, img.width, img.height);
    width = newWidth;
    height = newHeight;
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    canvas.toBlob(
      (blob) => {
        "Original file", file;
        "Compressed file", blob;
        var newImg = new File([blob], file.name, {
          type: file.type,
          lastModified: img.lastModified,
          size: 0.7,
        });
        datatransfert.items.add(newImg);
      },
      file.type,
      0.7
    );
  };
});

document.forms.upload.addEventListener("submit", (event) => {
  event.preventDefault();
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    const obj = JSON.parse(this.responseText);
    console.log(obj);
    obj.forEach((element) => {
      element.Instances.forEach((box) => {
        if (element.Name == "Car" || element.Name == "Person") {
          console.log("box : ");
          console.log(element.Name);
          ctx.strokeStyle = "rgba(255, 0, 0, 1)";
          ctx.strokeRect(
            box.BoundingBox.Left * width,
            box.BoundingBox.Top * height,
            box.BoundingBox.Width * width,
            box.BoundingBox.Height * height
          );
        }
      });
    });
  };
  xhttp.open("POST", "upload", true);
  xhttp.send(new FormData(document.forms.upload));
});

function calculateSize(img, maxWidth, maxHeight) {
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
}
