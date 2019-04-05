//@flow
import * as React from "react";
import ReactDOM from "react-dom";

export const Context = React.createContext({
    createNotification: () => undefined,
});

let portalContainer: HTMLDivElement = window.document.createElement("div");

type ComponentRenderProps = {|
    close: () => void,
|};

type ComponentRenderFunction = ComponentRenderProps => React.Node;

type Props = {
    children: React.Node,
};

type State = {|
    active: React.Node,
    stack: Array<ComponentRenderFunction>,
|};

export default class NotificationManager extends React.Component<Props, State> {
    el: HTMLDivElement;

    constructor() {
        super();

        window.document.body.appendChild(portalContainer);

        this.el = window.document.createElement("div");
    }

    state = {
        active: null,
        stack: [],
    };

    componentDidMount() {
        portalContainer.appendChild(this.el);
    }

    componentWillUnmount() {
        portalContainer.removeChild(this.el);
    }

    createNotification = (component: ComponentRenderFunction, props: Object) => {
        this.setState(prevState => {
            if (!prevState.active && prevState.stack.length === 0) {
                return {
                    active: component({ close: this.closeNotification, ...props }),
                };
            }
            return {
                stack: [...prevState.stack, component],
            };
        });
    };
    closeNotification = () => {
        this.setState(prevState => {
            const stack = prevState.stack.slice(1);
            const active = stack.length > 0 ? stack[0]({ close: this.closeNotification }) : null;
            return {
                active,
                stack,
            };
        });
    };
    render() {
        const { children } = this.props;
        return (
            <Context.Provider value={this.createNotification}>
                {children}
                {ReactDOM.createPortal(this.state.active, this.el)}
            </Context.Provider>
        );
    }
}
