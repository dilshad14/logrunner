plugins {
	java
	id("org.springframework.boot") version "3.3.6"
	id("io.spring.dependency-management") version "1.1.6"
	id("org.hibernate.orm") version "6.5.3.Final"
}
group = "ai.logrunner"
version = "0.0.1-SNAPSHOT"
java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}
repositories {
	mavenCentral()
	maven { url = uri("https://repo.spring.io/milestone") }
}
dependencyManagement {
	imports {
		mavenBom("org.springframework.ai:spring-ai-bom:1.0.0-M6")
	}
}
dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.ai:spring-ai-openai-spring-boot-starter")
	implementation("co.elastic.clients:elasticsearch-java:8.15.3")
	implementation("jakarta.json:jakarta.json-api:2.1.3")
	implementation("software.amazon.awssdk:cloudwatchlogs:2.28.25")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	runtimeOnly("com.h2database:h2")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
tasks.withType<Test> {
	useJUnitPlatform()
}
