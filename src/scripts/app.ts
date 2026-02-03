/**
 * Main Application Class
 */

export class App {
    private container: HTMLElement | null;

    constructor() {
        this.container = document.getElementById('app');
    }

    public init(): void {
        console.log('NoteTS');
        this.render();
    }

    private render(): void {
        if (!this.container) return;

        this.container.innerHTML = `
            <p>App</p>
        `;
    }
}
