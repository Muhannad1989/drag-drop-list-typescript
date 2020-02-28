LIST
-constructor:html elements + function calls
--addListener from outside
--renderProjects:give dynamic id to ul lists + append child + add content
--renderContent:give the list an id + h2 add content
--attach:insert element into dom

INPUTS
-constructor:html elements + function calls + submit
--gatherUserInput validations and required
--clearInputs

--submitHandler
--configure => addEventListener:submitHandler
--attach

STATE
+static instance: StateManagement;
assignedProjects
-constructor empty

--getInstance static
--addListener : inside ProjectList

--addProject: we added projectState.addProject inside ProjectInput (object data)

const myProject = StateManagement.getInstance();

---

constructor : to render when you made instance from class
! or if : condition to ignore null data
private attach method: use "private" to use it in the same class
importNode + content + firstChild: whole content of divForm "all children"
appendChild and insertAdjacentHTML: import child to parent
_notice_:all property should be used in contracture, not in methods
this: check "this" where it refer when you use event
decorator:
validation and types:
be aware with runtime and typescript while development:typeOf , instanceOf but Array.isArray()
(union) and (name?:string ) are the same
validation function + interface => bring our input data =>

how we can access addProject from list, for adding new item,
global instance:
and how update list when you new item
listeners: which is subscription pattern

for tomorrow
check this.project.slice()

classes can be used for reusability and singleton

-video 10- new class "Project" for type using constructor, then  
1-use it as type: private project:Project[]
2-use it's parameters as to instantiate new object: new Project(title, description, people...)

abstract class: is only for inheritance, you can no instantiated => new BlaBla() <= this is no valid
abstract method: should be in the instantiated class
private and abstract method together is not allowed in javascript
you have to define all abstract method in the driven class and call in in the super
**try always to call functions in the inheriting class to avoid some issues of rendering **

you can set from out side as following example
type Listener<T>=((item:<T>) => void)

_notice_ the relation between this.element refers to our render element example => li:
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
element: U;
}
constructor()
super()
inside method(){ this.element }

each li could be instantiated class
duplicated properties in class could be in an based class
nex plan : practice on drag and drop + class + types

install
webpack
webpack-cli
webpack-dev-server
ts-loader
typescript

<!-- command lines -->

tsc --init
tsc -w
