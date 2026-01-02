import { codegen } from 'swagger-axios-codegen';

codegen({
    methodNameMode: 'path',
    remoteUrl: 'http://localhost:8080/api-json',
    outputDir: './src/api/services',
    modelMode: 'interface',
    multipleFileMode: true,
    useStaticMethod: true
}).then()
