const OPERATORS: any = {
    'MergeMap': 'flatMap'
};

export const parseOperatorName = (name: string) => {
    if (OPERATORS[name] !== undefined) {
        return OPERATORS[name];
    } else {
        return name.charAt(0).toLowerCase() + name.substr(1, name.length);
    }
};

const OBSERVABLES: any = {
    'IntervalObservable': 'interval'
};

export const parseObservableName = (name: string) => {
    if (OBSERVABLES[name]) {
        return OBSERVABLES[name];
    } else if (name === 'Observable') {
        return name;
    } else {
        return name.replace(/Observable/, '');
    }
};
