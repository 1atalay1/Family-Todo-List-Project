function handler(id) {
    document.getElementById("title" + id).setAttribute("hidden", true)
    document.getElementById("edit" + id).setAttribute("hidden", true)
    document.getElementById("done" + id).removeAttribute("hidden")
    document.getElementById("input" + id).removeAttribute("hidden")
    document.getElementById("input" + id).focus();
  }


 