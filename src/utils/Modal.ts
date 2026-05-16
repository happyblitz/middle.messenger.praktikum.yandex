export default class Modal {
  public static closeAllModals() {
    document
      .querySelectorAll<HTMLElement>("[data-js-modal]")
      .forEach((modal) => {
        modal.style.display = "none";
      });
  }

  public static openModal(modal: HTMLElement) {
    Modal.closeAllModals();
    modal.style.display = "block";
  }
}
