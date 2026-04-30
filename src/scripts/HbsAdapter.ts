import Handlebars from "handlebars";

interface IViteConfigModule {
  default: string;
}

interface IViteRawModule {
  [path: string]: IViteConfigModule;
}

interface IHbsAdapter {
  extractHbsFileName: (filePath: string) => string;
  initComponents: () => void;
  initLayouts: () => void;
  compile: (templateName: string, context: Record<string, any>) => string;
}

class HbsAdapter implements IHbsAdapter {
  templates: Map<string, string>;

  constructor() {
    this.templates = new Map();

    this.initComponents();
    this.initLayouts();
  }

  extractHbsFileName(filePath: string) {
    return filePath.replaceAll(/.+\//g, "").replace(".hbs", "");
  }

  initComponents() {
    const components = import.meta.glob(
      "../../static/templates/components/*.hbs",
      {
        eager: true,
        query: "?raw",
      },
    ) as IViteRawModule;
    Object.entries(components).forEach(([componentPath, component]) => {
      const componentName = this.extractHbsFileName(componentPath);
      Handlebars.registerPartial(componentName, component.default);
    });
  }

  initLayouts() {
    const layouts = import.meta.glob("../../static/templates/layouts/*.hbs", {
      eager: true,
      query: "?raw",
    }) as IViteRawModule;
    Object.entries(layouts).forEach(([layoutPath, component]) => {
      const templateName = this.extractHbsFileName(layoutPath);
      this.templates.set(templateName, component.default);
    });
  }

  compile(templateName: string, context: Record<string, any> = {}) {
    const template = this.templates.get(templateName);
    if (template) {
      return Handlebars.compile(template)(context);
    }

    return "";
  }
}

const hbsAdapter = new HbsAdapter();
export default hbsAdapter;
