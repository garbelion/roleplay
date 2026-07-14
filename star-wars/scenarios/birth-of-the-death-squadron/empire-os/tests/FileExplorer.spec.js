import { describe, it, expect, beforeEach, mount } from "vitest";
import FileExplorer from "../src/components/FileExplorer.vue";

describe("FileExplorer.vue - Feature 1: Afficher une liste de fichiers .docx", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(FileExplorer);
  });

  it("devrait afficher une liste de fichiers .docx", () => {
    const fileItems = wrapper.findAll(".file-item");
    expect(fileItems.length).toBe(4);
  });

  it("devrait afficher les noms de fichiers corrects", () => {
    const fileNames = wrapper.findAll(".file-item").map(item => item.text());
    expect(fileNames).toEqual([
      "rapport_mission.docx",
      "ordre_executor.docx",
      "liste_cibles.docx",
      "protocole_secret.docx"
    ]);
  });

  it("devrait avoir un style DOS-like", () => {
    const explorer = wrapper.find(".file-explorer");
    expect(explorer.classes()).toContain("file-explorer");
  });

  it("devrait afficher un en-tete de terminal", () => {
    const header = wrapper.find(".terminal-header");
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain("C:\\EmpireOS\\Fichiers>");
  });

  it("devrait permettre la selection de fichiers", async () => {
    const firstFile = wrapper.findAll(".file-item")[0];
    await firstFile.trigger("click");
    expect(wrapper.vm.selectedFiles).toContain(0);
  });

  it("devrait deselectionner un fichier deja selectionne", async () => {
    const firstFile = wrapper.findAll(".file-item")[0];
    await firstFile.trigger("click");
    expect(wrapper.vm.selectedFiles).toContain(0);
    await firstFile.trigger("click");
    expect(wrapper.vm.selectedFiles).not.toContain(0);
  });

  it("devrait emettre un evenement lors de la selection de fichiers", async () => {
    const firstFile = wrapper.findAll(".file-item")[0];
    await firstFile.trigger("click");
    expect(wrapper.emitted("files-selected")).toBeTruthy();
    expect(wrapper.emitted("files-selected")[0]).toEqual([[0]]);
  });

  it("devrait avoir une methode getFiles qui retourne la liste des fichiers", () => {
    const files = wrapper.vm.getFiles();
    expect(files.length).toBe(4);
    expect(files[0].name).toBe("rapport_mission.docx");
  });

  it("devrait avoir une methode setFiles qui met a jour la liste", () => {
    const newFiles = [{ name: "nouveau_fichier.docx", size: 100, type: "docx" }];
    wrapper.vm.setFiles(newFiles);
    expect(wrapper.vm.files).toEqual(newFiles);
  });
});