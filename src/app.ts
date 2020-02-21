enum Status {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: Status,
  ) {}
}

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// Project State Management/ singleton
class ProjectState extends State<Project> {
  // private listeners: Listener[] = [];
  // array of object class
  private projects: Project[] = [];
  private static instance: ProjectState;

  // calling State => addListener
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  // addListener(listenerFn: Listener) {
  //   this.listeners.push(listenerFn);
  // }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      Status.Active, //Active by default
    );
    // add new project to projects and loop throw listeners
    this.projects.push(newProject);
    // loop inside listeners and call every item:function

    this.updateListeners();
    // for (const callFunction of this.listeners) {
    //   callFunction(this.projects.slice());
    // }
  }

  moveProject(proId: string, newStatus: Status) {
    const project = this.projects.find(pro => pro.id === proId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const callFunction of this.listeners) {
      // each time we call function and passing all projects
      callFunction(this.projects.slice());
    }
  }
}

// singleton class
// create one single object has addProject(data obj) and listeners(functions)
const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  // content of templateElement which is form or li or section
  element: U;
  constructor(
    templateID: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(
      templateID,
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true,
    );
    // dynamic element
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    // this is already called inside all drived
    this.attach(insertAtStart);
  }
  private attach(posation: boolean) {
    this.hostElement.insertAdjacentElement(
      posation ? 'afterbegin' : 'beforeend',
      this.element,
    );
  }

  // those functions should be used in derived objects (ProjectItem,ProjectList)
  abstract configure(): void;

  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private project: Project;

  // projectItem
  constructor(hostId: string, project: Project) {
    // component
    super('single-project', hostId, false, project.id);

    this.project = project;
    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    // console.log(event);
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_: DragEvent) {
    console.log('end Handler');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  get total(): string {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent =
      this.total + ' ' + 'assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    // initial value
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const proId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      proId,
      this.type === 'active' ? Status.Active : Status.Finished,
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
    // you can log this here
    // in the nex line we have "project: Project[]" means => copy: this.projects.slice()
    projectState.addListener((project: Project[]) => {
      const relaventProject = project.filter(pro => {
        if (this.type === 'active') {
          return pro.status === Status.Active;
        }
        return pro.status === Status.Finished;
      });
      // reade from assignedProjects afterwards write/create into html Dom
      this.assignedProjects = relaventProject;
      this.renderProjects();
    });
  }

  // private
  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  // fill elements with data
  private renderProjects() {
    const list = document.getElementById(
      `${this.type}-projects-list`,
    )! as HTMLUListElement;
    list.innerHTML = '';
    // loop throw all items
    for (const item of this.assignedProjects) {
      // element here is the content of "project-list"
      new ProjectItem(this.element.querySelector('ul')!.id, item);
    }
  }
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = this.element.querySelector(
      '#title',
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description',
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people',
    ) as HTMLInputElement;

    this.configure();
  }

  // inherited from Component
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  // inherited from Component
  renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again!');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    // return filtered inputs
    const userInput = this.gatherUserInput();
    // check if there is array
    if (Array.isArray(userInput)) {
      // destructuring
      const [title, desc, people] = userInput;
      // use global class to pass our result to lists
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
